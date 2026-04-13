const Product = require('../models/product.model');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Review = require('../models/review.model');

exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [totalProducts, totalOrders, totalCustomers, pendingReviews, recentOrders,
           revenueAgg, monthlyRevAgg, statusAgg, topProductsAgg] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Customer.countDocuments({ status: 'active' }),
      Review.countDocuments({ status: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name email'),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo }, paymentStatus: 'paid' } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$product.name', totalSold: 1 } },
      ]),
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear(); const m = d.getMonth() + 1;
      const found = monthlyRevAgg.find(r => r._id.year === y && r._id.month === m);
      revenueByMonth.push({ month: MONTHS[m - 1], revenue: found?.revenue || 0 });
    }

    const ordersByStatus = {};
    statusAgg.forEach(s => { if (s._id) ordersByStatus[s._id] = s.count; });

    res.status(200).json({
      status: 'success',
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        pendingReviews,
        totalRevenue: revenueAgg[0]?.total || 0,
        recentOrders,
        revenueByMonth,
        ordersByStatus,
        topProducts: topProductsAgg,
      },
    });
  } catch (err) { next(err); }
};
