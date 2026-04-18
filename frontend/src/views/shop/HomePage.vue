<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { publicAPI } from '@/api/index'
import { cart } from '@/stores/cart'

const router    = useRouter()
const products  = ref<any[]>([])
const banners   = ref<any[]>([])
const loading   = ref(true)
const bannerIdx = ref(0)
let bannerTimer: ReturnType<typeof setInterval> | null = null

// ── Scroll reveal via IntersectionObserver ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible')
        observer.unobserve(e.target)
      }
    })
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
)

function observeReveal() {
  nextTick(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el))
  })
}

onMounted(async () => {
  observeReveal()
  try {
    const [pRes, bRes] = await Promise.all([
      publicAPI.getProducts({ status: 'active', limit: 8, isFeatured: true }),
      publicAPI.getBanners({ status: 'active' }),
    ])
    products.value = pRes.data.data?.products ?? pRes.data.data ?? []
    banners.value  = bRes.data.data?.banners  ?? bRes.data.data ?? []
  } catch { /* ignore */ } finally {
    loading.value = false
    observeReveal()
  }
  if (banners.value.length > 1) {
    bannerTimer = setInterval(() => {
      bannerIdx.value = (bannerIdx.value + 1) % banners.value.length
    }, 5000)
  }
})
onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer)
  observer.disconnect()
})

const currentBanner = computed(() => banners.value[bannerIdx.value] ?? null)

function prevBanner() {
  bannerIdx.value = (bannerIdx.value - 1 + banners.value.length) % banners.value.length
}
function nextBanner() {
  bannerIdx.value = (bannerIdx.value + 1) % banners.value.length
}
function addToCart(p: any) {
  cart.add({ productId: p._id, name: p.name, price: p.price, salePrice: p.salePrice, image: p.images?.[0] ?? '', quantity: 1 })
}
</script>

<template>
  <div class="home">

    <!-- ══ 1. BANNER CAROUSEL ══ -->
    <section class="banner-section">
      <div class="banner-slides">
        <transition name="banner-fade" mode="out-in">
          <div
            v-if="banners.length && currentBanner"
            :key="bannerIdx"
            class="banner-slide"
            :style="currentBanner.image ? { backgroundImage: 'url(' + currentBanner.image + ')' } : {}"
          >
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span v-if="currentBanner.badge || currentBanner.subtitle" class="banner-chip">
                {{ currentBanner.badge ?? currentBanner.subtitle ?? 'New Arrival' }}
              </span>
              <h1 class="banner-title">{{ currentBanner.title ?? 'Fris-b STEAM Kits' }}</h1>
              <p class="banner-sub">{{ currentBanner.description ?? 'Complete project kits delivered to your door.' }}</p>
              <div class="banner-btns">
                <router-link :to="currentBanner.link ?? '/shop'" class="btn-banner-primary">
                  {{ currentBanner.cta ?? 'Shop Now' }}
                </router-link>
                <router-link to="/shop" class="btn-banner-outline">Browse All Kits</router-link>
              </div>
            </div>
          </div>
          <div v-else key="fallback" class="banner-slide banner-fallback">
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-chip">STEAM Learning Kits</span>
              <h1 class="banner-title">Build the Future,<br><em class="banner-em">One Kit at a Time</em></h1>
              <p class="banner-sub">Hands-on project kits with every component included. Buy a project, build it, understand it.</p>
              <div class="banner-btns">
                <router-link to="/shop" class="btn-banner-primary">Shop Now</router-link>
                <router-link to="/about" class="btn-banner-outline">Learn More</router-link>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <button v-if="banners.length > 1" class="banner-arrow banner-arrow--left" @click="prevBanner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button v-if="banners.length > 1" class="banner-arrow banner-arrow--right" @click="nextBanner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div v-if="banners.length > 1" class="banner-dots">
        <button
          v-for="(_, i) in banners" :key="i"
          class="banner-dot" :class="{ 'banner-dot--active': i === bannerIdx }"
          @click="bannerIdx = i"
        ></button>
      </div>

      <div class="banner-stats">
        <div class="bs-item"><span class="bs-num">50+</span><span class="bs-lbl">Projects</span></div>
        <div class="bs-div"></div>
        <div class="bs-item"><span class="bs-num">1200+</span><span class="bs-lbl">Students</span></div>
        <div class="bs-div"></div>
        <div class="bs-item"><span class="bs-num">100%</span><span class="bs-lbl">Complete Kits</span></div>
        <div class="bs-div"></div>
        <div class="bs-item"><span class="bs-num">4.9★</span><span class="bs-lbl">Avg Rating</span></div>
      </div>
    </section>

    <!-- ══ 2. FEATURED KITS ══ -->
    <section class="featured-section">
      <div class="featured-inner">

        <!-- Header -->
        <div class="featured-head reveal">
          <div class="featured-head-left">
            <p class="eyebrow">Handpicked for you</p>
            <h2 class="featured-title">Featured Kits</h2>
            <p class="featured-sub">Curated STEAM project kits — every component included, ready to build.</p>
          </div>
          <router-link to="/shop" class="btn-see-all">View All Kits <span>→</span></router-link>
        </div>

        <!-- Loading skeletons -->
        <div v-if="loading" class="kits-grid">
          <div v-for="i in 4" :key="i" class="kit-skeleton"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="products.length === 0" class="kits-empty reveal">
          <div class="kits-empty-icon">📦</div>
          <p class="kits-empty-text">No featured kits yet.</p>
          <router-link to="/shop" class="btn-empty">Browse All Kits</router-link>
        </div>

        <!-- Product grid -->
        <div v-else class="kits-grid">
          <div
            v-for="(p, idx) in products" :key="p._id"
            class="kit-card reveal"
            :style="{ '--d': (idx % 4) * 90 + 'ms' }"
          >
            <!-- Image -->
            <div class="kit-img-wrap" @click="router.push('/shop/' + p._id)">
              <img v-if="p.images?.[0]" :src="p.images[0]" class="kit-img" :alt="p.name" loading="lazy" />
              <div v-else class="kit-img-blank">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c0cdd9" stroke-width="1.2" width="44" height="44" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <!-- Badges -->
              <span v-if="p.salePrice" class="kit-badge kit-badge--sale">SALE</span>
              <span v-else-if="p.isFeatured" class="kit-badge kit-badge--featured">Featured</span>
              <!-- Hover overlay -->
              <div class="kit-hover-overlay">
                <button class="kit-quick-view" @click.stop="router.push('/shop/' + p._id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Quick View
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="kit-body">
              <div class="kit-tags" v-if="p.tags?.length">
                <span v-for="t in p.tags.slice(0, 2)" :key="t._id ?? t" class="kit-tag">{{ t.name ?? t }}</span>
              </div>
              <p class="kit-name" @click="router.push('/shop/' + p._id)">{{ p.name }}</p>
              <p class="kit-desc">{{ p.shortDescription || (p.description ?? '').slice(0, 75) }}</p>

              <!-- Footer -->
              <div class="kit-foot">
                <div class="kit-pricing">
                  <span class="kit-price">Rs {{ (p.salePrice ?? p.price).toLocaleString() }}</span>
                  <span v-if="p.salePrice" class="kit-old">Rs {{ p.price.toLocaleString() }}</span>
                </div>
                <button class="kit-cart-btn" title="Add to cart" @click="addToCart(p)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ══ 3. WHAT IS FRIS-B ══ -->
    <section class="about-split-section">
      <div class="split-visual">
        <div class="split-big-text">Test</div>
        <!-- <div class="split-icons-grid">
          <div class="split-icon-card reveal" style="--d:0ms"><span>🤖</span><p>Robotics</p></div>
          <div class="split-icon-card reveal" style="--d:100ms"><span>🔌</span><p>Electronics</p></div>
          <div class="split-icon-card reveal" style="--d:200ms"><span>💡</span><p>Innovation</p></div>
          <div class="split-icon-card reveal" style="--d:300ms"><span>🛠️</span><p>Engineering</p></div>
        </div> -->
      </div>
      <div class="split-content">
        <p class="eyebrow" style="color:#ffde59">What is Fris-b?</p>
        <h2 class="split-title reveal">One box.<br>Everything inside.<br>Real learning.</h2>
        <p class="split-body reveal" style="--d:80ms">Most students struggle to find the right components for their STEAM projects. Fris-b solves that — every kit ships with every single part you need, pre-selected and quality checked, so you can focus entirely on building and learning.</p>
        <div class="split-points">
          <div class="split-point reveal" style="--d:0ms">
            <div class="sp-icon">✓</div>
            <div><p class="sp-title">No hunting for parts</p><p class="sp-sub">Every resistor, wire, sensor, and module is included.</p></div>
          </div>
          <div class="split-point reveal" style="--d:120ms">
            <div class="sp-icon">✓</div>
            <div><p class="sp-title">Designed by engineers</p><p class="sp-sub">Kits are curated by experienced educators and engineers.</p></div>
          </div>
          <div class="split-point reveal" style="--d:240ms">
            <div class="sp-icon">✓</div>
            <div><p class="sp-title">Grades 6–12 & beyond</p><p class="sp-sub">Suitable for students, hobbyists, and professionals alike.</p></div>
          </div>
        </div>
        <router-link to="/shop" class="btn-split reveal" style="--d:360ms">Explore All Kits →</router-link>
      </div>
    </section>

    <!-- ══ 4. CATEGORIES ══ -->
    <section class="categories-section">
      <div class="section-inner">
        <div class="section-head centered reveal">
          <p class="eyebrow">Something for everyone</p>
          <h2 class="section-title">Project Categories</h2>
          <p class="section-sub">From beginner electronics to advanced robotics — pick a domain and dive in.</p>
        </div>
        <div class="cat-grid">
          <div class="cat-card reveal" style="--d:0ms"   @click="router.push('/shop')"><div class="cat-icon">🚗</div><h3 class="cat-name">RC Vehicles</h3><p class="cat-desc">Build remote-controlled cars, boats, and rovers from scratch.</p><span class="cat-link">Browse →</span></div>
          <div class="cat-card reveal" style="--d:80ms"  @click="router.push('/shop')"><div class="cat-icon">🤖</div><h3 class="cat-name">Robotics</h3><p class="cat-desc">Robotic arms, automated systems, and servo-based machines.</p><span class="cat-link">Browse →</span></div>
          <div class="cat-card reveal" style="--d:160ms" @click="router.push('/shop')"><div class="cat-icon">🚁</div><h3 class="cat-name">Drones</h3><p class="cat-desc">Mini quadcopters and FPV kits with all flight components.</p><span class="cat-link">Browse →</span></div>
          <div class="cat-card reveal" style="--d:240ms" @click="router.push('/shop')"><div class="cat-icon">🌱</div><h3 class="cat-name">Smart Farming</h3><p class="cat-desc">Automated irrigation, soil sensors, and greenhouse controls.</p><span class="cat-link">Browse →</span></div>
          <div class="cat-card reveal" style="--d:320ms" @click="router.push('/shop')"><div class="cat-icon">🔋</div><h3 class="cat-name">Energy & IoT</h3><p class="cat-desc">Solar panels, smart home automation, and IoT sensor kits.</p><span class="cat-link">Browse →</span></div>
          <div class="cat-card reveal" style="--d:400ms" @click="router.push('/shop')"><div class="cat-icon">📡</div><h3 class="cat-name">Communication</h3><p class="cat-desc">RF, Bluetooth, and wireless communication project kits.</p><span class="cat-link">Browse →</span></div>
        </div>
      </div>
    </section>

    <!-- ══ 5. WHY CHOOSE US ══ -->
    <section class="why-section">
      <div class="why-inner">
        <div class="why-left reveal">
          <p class="eyebrow" style="color:#ffde59">Why Fris-b?</p>
          <h2 class="why-title">The complete kit experience — start to finish.</h2>
          <p class="why-body">We obsess over every detail so you don't have to. From component quality to packaging, each Fris-b kit is built to give you the best building experience possible.</p>
          <router-link to="/shop" class="btn-why">Start Building →</router-link>
        </div>
        <div class="why-right">
          <div class="why-card reveal" style="--d:0ms"><div class="why-num">01</div><h3 class="why-card-title">Complete Component List</h3><p class="why-card-body">We list every single part in each kit. No surprises, no missing items. Everything is verified before packing.</p></div>
          <div class="why-card reveal" style="--d:100ms"><div class="why-num">02</div><h3 class="why-card-title">Quality Tested</h3><p class="why-card-body">Every component is individually tested. Dead-on-arrival items are replaced before your order ships.</p></div>
          <div class="why-card reveal" style="--d:200ms"><div class="why-num">03</div><h3 class="why-card-title">Expert Curation</h3><p class="why-card-body">Kits are designed by engineers who have built these projects themselves — no guesswork involved.</p></div>
          <div class="why-card reveal" style="--d:300ms"><div class="why-num">04</div><h3 class="why-card-title">Fast Nationwide Delivery</h3><p class="why-card-body">Orders shipped within 24 hours. Tracked delivery anywhere in Pakistan.</p></div>
        </div>
      </div>
    </section>

    <!-- ══ 6. TESTIMONIALS ══ -->
    <section class="testimonials-section">
      <div class="section-inner">
        <div class="section-head centered reveal">
          <p class="eyebrow">Real students, real builds</p>
          <h2 class="section-title">What Builders Say</h2>
        </div>
        <div class="testi-grid">
          <div class="testi-card reveal" style="--d:0ms">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-body">"I ordered the Robotic Arm kit and every single component was there. Built it in a weekend — works perfectly. This is exactly what students need."</p>
            <div class="testi-author"><div class="testi-avatar">A</div><div><p class="testi-name">Ahmad Raza</p><p class="testi-role">Engineering Student, Lahore</p></div></div>
          </div>
          <div class="testi-card testi-card--accent reveal" style="--d:140ms">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-body">"Finally a service that understands students. No more going to 10 different shops. I got my drone kit and it had literally everything I needed."</p>
            <div class="testi-author"><div class="testi-avatar">S</div><div><p class="testi-name">Sara Malik</p><p class="testi-role">Robotics Club, Karachi</p></div></div>
          </div>
          <div class="testi-card reveal" style="--d:280ms">
            <div class="testi-stars">★★★★★</div>
            <p class="testi-body">"The smart irrigation kit was perfect for my final year project. Fast delivery, well-packaged, and every component was high quality."</p>
            <div class="testi-author"><div class="testi-avatar">U</div><div><p class="testi-name">Usman Khan</p><p class="testi-role">Final Year Student, Islamabad</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ 7. CTA ══ -->
    <section class="cta-section">
      <div class="cta-inner reveal">
        <p class="eyebrow" style="color:rgba(255,255,255,.45)">Ready to build?</p>
        <h2 class="cta-title">Your next project kit is waiting.</h2>
        <p class="cta-sub">Join 1,200+ students already building with Fris-b kits. Every component included, delivered fast.</p>
        <div class="cta-btns">
          <router-link to="/shop" class="btn-cta-primary">Browse All Kits →</router-link>
          <router-link to="/login" class="btn-cta-outline">Create Free Account</router-link>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home { overflow-x: hidden; }

/* ══ SCROLL REVEAL ══ */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity   0.6s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms);
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ══ Shared atoms ══ */
.eyebrow {
  font-size: 13px; font-weight: 800; letter-spacing: .12em;
  text-transform: uppercase; color: #ffde59; margin-bottom: 10px;
}
.section-inner  { max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }
.section-title  { font-size: clamp(22px, 3vw, 34px); font-weight: 900; color: #545454; }
.section-sub    { font-size: 15px; color: #64748b; margin-top: 8px; line-height: 1.6; }
.section-head   { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; flex-wrap: wrap; gap: 12px; }
.section-head.centered { flex-direction: column; align-items: center; text-align: center; }

/* ══ 1. BANNER ══ */
.banner-section  { position: relative; height: 100vh; min-height: 560px; display: flex; flex-direction: column; }
.banner-slides   { flex: 1; position: relative; overflow: hidden; }
.banner-slide    { position: absolute; inset: 0; background: #2a2a2a center/cover no-repeat; display: flex; align-items: center; }
.banner-fallback { background: linear-gradient(135deg, #3a3a3a 0%, #545454 100%); }
.banner-overlay  { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,.75) 35%, rgba(0,0,0,.15)); }
.banner-content  { position: relative; z-index: 1; padding: 0 64px; max-width: 700px; }
.banner-chip     { display: inline-block; background: rgba(255,222,89,.15); color: #ffde59; font-size: 11px; font-weight: 800; letter-spacing: .12em; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,222,89,.35); margin-bottom: 22px; text-transform: uppercase; }
.banner-title    { font-size: clamp(36px, 5vw, 68px); font-weight: 900; color: #fff; line-height: 1.05; margin-bottom: 18px; }
.banner-em       { color: #ffde59; font-style: normal; }
.banner-sub      { font-size: clamp(14px, 1.5vw, 18px); color: rgba(255,255,255,.7); line-height: 1.7; margin-bottom: 34px; max-width: 520px; }
.banner-btns     { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-banner-primary  { display: inline-flex; align-items: center; padding: 14px 28px; border-radius: 12px; background: #ffde59; color: #545454; font-size: 15px; font-weight: 800; text-decoration: none; transition: transform .15s, box-shadow .15s; box-shadow: 0 4px 20px rgba(255,222,89,.4); }
.btn-banner-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,222,89,.55); }
.btn-banner-outline  { display: inline-flex; align-items: center; padding: 14px 28px; border-radius: 12px; background: transparent; color: #fff; font-size: 15px; font-weight: 600; text-decoration: none; border: 2px solid rgba(255,255,255,.3); transition: border-color .15s; }
.btn-banner-outline:hover { border-color: rgba(255,255,255,.75); }
.banner-arrow    { position: absolute; top: 50%; transform: translateY(-60%); z-index: 10; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; backdrop-filter: blur(4px); }
.banner-arrow:hover      { background: rgba(255,255,255,.28); }
.banner-arrow--left      { left: 20px; }
.banner-arrow--right     { right: 20px; }
.banner-dots             { position: absolute; bottom: 72px; left: 64px; display: flex; gap: 8px; z-index: 10; }
.banner-dot              { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.35); border: none; cursor: pointer; transition: all .22s; }
.banner-dot--active      { background: #ffde59; width: 24px; border-radius: 4px; }
.banner-stats            { display: flex; align-items: center; background: #545454; flex-shrink: 0; }
.bs-item  { flex: 1; text-align: center; padding: 18px 12px; }
.bs-num   { display: block; font-size: 22px; font-weight: 900; color: #ffde59; }
.bs-lbl   { display: block; font-size: 11px; color: rgba(255,255,255,.5); margin-top: 3px; text-transform: uppercase; letter-spacing: .06em; }
.bs-div   { width: 1px; height: 30px; background: rgba(255,255,255,.12); flex-shrink: 0; }
.banner-fade-enter-active, .banner-fade-leave-active { transition: opacity .6s ease; }
.banner-fade-enter-from,   .banner-fade-leave-to     { opacity: 0; }

/* ══ 2. FEATURED KITS ══ */
.featured-section {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  padding: 96px 0;
}
.featured-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}
.featured-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 44px;
  gap: 16px;
  flex-wrap: wrap;
}
.featured-head-left { flex: 1; }
.featured-title {
  font-size: clamp(26px, 3.5vw, 40px);
  font-weight: 900;
  color: #1e1e1e;
  margin-bottom: 6px;
}
.featured-sub {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
}
.btn-see-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border-radius: 10px;
  background: #545454;
  color: #ffde59;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
  transition: opacity .15s;
}
.btn-see-all:hover { opacity: .85; }

/* Skeletons */
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
.kits-grid    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.kit-skeleton {
  height: 380px;
  border-radius: 20px;
  background: linear-gradient(90deg, #e8ecf2 25%, #f0f4f8 50%, #e8ecf2 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

/* Empty */
.kits-empty       { text-align: center; padding: 80px 20px; }
.kits-empty-icon  { font-size: 52px; margin-bottom: 16px; }
.kits-empty-text  { font-size: 15px; color: #94a3b8; margin-bottom: 22px; }
.btn-empty {
  display: inline-block;
  padding: 11px 26px;
  border-radius: 10px;
  background: #545454;
  color: #ffde59;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

/* Kit card */
.kit-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eaecf0;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04);
  transition: transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s;
}
.kit-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 24px 56px rgba(0,0,0,.12);
}
.kit-img-wrap {
  height: 220px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: linear-gradient(135deg, #eef1f6, #e4e8ef);
}
.kit-img          { width: 100%; height: 100%; object-fit: cover; transition: transform .4s cubic-bezier(0.16,1,0.3,1); }
.kit-card:hover .kit-img { transform: scale(1.08); }
.kit-img-blank    { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.kit-badge        { position: absolute; top: 12px; left: 12px; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 20px; letter-spacing: .06em; text-transform: uppercase; }
.kit-badge--sale     { background: #ef4444; color: #fff; }
.kit-badge--featured { background: #ffde59; color: #545454; }
.kit-hover-overlay {
  position: absolute; inset: 0;
  background: rgba(20,20,20,.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .25s;
  backdrop-filter: blur(3px);
}
.kit-card:hover .kit-hover-overlay { opacity: 1; }
.kit-quick-view {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; border-radius: 10px;
  background: #ffde59; color: #545454;
  font-size: 12px; font-weight: 800;
  border: none; cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,.3);
  transition: transform .15s;
}
.kit-quick-view:hover { transform: scale(1.04); }

.kit-body    { padding: 18px 18px 16px; }
.kit-tags    { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
.kit-tag     { font-size: 10px; font-weight: 700; color: #64748b; background: #f1f4f8; padding: 3px 8px; border-radius: 5px; text-transform: uppercase; letter-spacing: .04em; }
.kit-name    { font-size: 14px; font-weight: 800; color: #1e1e1e; line-height: 1.4; margin-bottom: 6px; cursor: pointer; }
.kit-name:hover { color: #545454; }
.kit-desc    {
  font-size: 12px; color: #94a3b8; line-height: 1.55; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 37px;
}
.kit-foot    { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f4f8; padding-top: 13px; }
.kit-pricing { display: flex; align-items: baseline; gap: 7px; }
.kit-price   { font-size: 16px; font-weight: 900; color: #1e1e1e; }
.kit-old     { font-size: 11px; color: #c0cdd9; text-decoration: line-through; }
.kit-cart-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: #545454; color: #ffde59;
  border: none; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .15s, transform .15s;
}
.kit-cart-btn:hover { background: #333; transform: scale(1.12); }

/* ══ 3. ABOUT SPLIT ══ */
.about-split-section { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
.split-visual {
  background: #545454;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 48px; gap: 32px; position: relative; overflow: hidden;
}
.split-big-text {
  font-size: clamp(60px, 9vw, 120px); font-weight: 900;
  color: rgba(255,255,255,.06); letter-spacing: .05em;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  white-space: nowrap; pointer-events: none; user-select: none;
}
.split-icons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; position: relative; z-index: 1; }
.split-icon-card  { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 24px 20px; text-align: center; transition: background .2s, transform .2s; }
.split-icon-card:hover { background: rgba(255,222,89,.12); transform: translateY(-3px); }
.split-icon-card span { font-size: 32px; display: block; margin-bottom: 10px; }
.split-icon-card p    { font-size: 12px; color: rgba(255,255,255,.6); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; }
.split-content { background: #fff; display: flex; flex-direction: column; justify-content: center; padding: 60px 64px; }
.split-title   { font-size: clamp(26px, 3vw, 42px); font-weight: 900; color: #545454; line-height: 1.15; margin-bottom: 20px; }
.split-body    { font-size: 15px; color: #64748b; line-height: 1.8; margin-bottom: 28px; }
.split-points  { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.split-point   { display: flex; gap: 14px; align-items: flex-start; }
.sp-icon       { width: 26px; height: 26px; border-radius: 50%; background: #ffde59; color: #545454; font-size: 12px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.sp-title      { font-size: 14px; font-weight: 700; color: #545454; margin-bottom: 3px; }
.sp-sub        { font-size: 13px; color: #64748b; }
.btn-split     { display: inline-flex; padding: 13px 24px; border-radius: 12px; background: #545454; color: #ffde59; font-size: 14px; font-weight: 800; text-decoration: none; align-self: flex-start; transition: opacity .15s; }
.btn-split:hover { opacity: .85; }

/* ══ 4. CATEGORIES ══ */
.categories-section { min-height: 100vh; background: #fff; padding: 96px 0; display: flex; align-items: center; }
.cat-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.cat-card  {
  background: #fafbfc; border-radius: 20px; padding: 32px 26px;
  border: 1px solid #eaecf0; cursor: pointer;
  transition: transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s;
  position: relative; overflow: hidden;
}
.cat-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,222,89,.08) 0%, transparent 60%);
  opacity: 0; transition: opacity .3s;
}
.cat-card:hover { transform: translateY(-7px); box-shadow: 0 18px 44px rgba(0,0,0,.1); }
.cat-card:hover::after { opacity: 1; }
.cat-icon  { font-size: 42px; margin-bottom: 16px; display: block; }
.cat-name  { font-size: 16px; font-weight: 800; color: #1e1e1e; margin-bottom: 8px; }
.cat-desc  { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 18px; }
.cat-link  { font-size: 12px; font-weight: 700; color: #ffde59; background: #545454; padding: 5px 14px; border-radius: 20px; display: inline-block; position: relative; z-index: 1; }

/* ══ 5. WHY ══ */
.why-section { min-height: 100vh; background: #1e1e1e; display: flex; align-items: center; padding: 96px 0; }
.why-inner   { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; width: 100%; }
.why-title   { font-size: clamp(26px, 3.5vw, 44px); font-weight: 900; color: #fff; line-height: 1.2; margin-bottom: 18px; }
.why-body    { font-size: 15px; color: rgba(255,255,255,.5); line-height: 1.8; margin-bottom: 32px; }
.btn-why     { display: inline-flex; padding: 13px 24px; border-radius: 12px; background: #ffde59; color: #545454; font-size: 14px; font-weight: 800; text-decoration: none; transition: transform .15s; box-shadow: 0 4px 20px rgba(255,222,89,.35); }
.btn-why:hover { transform: translateY(-2px); }
.why-right   { display: flex; flex-direction: column; gap: 16px; }
.why-card    {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px; padding: 24px;
  transition: background .2s, border-color .2s, transform .2s;
}
.why-card:hover { background: rgba(255,222,89,.06); border-color: rgba(255,222,89,.2); transform: translateX(8px); }
.why-num        { font-size: 28px; font-weight: 800; color: #ffde59; letter-spacing: .1em; margin-bottom: 8px; }
.why-card-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.why-card-body  { font-size: 13px; color: rgba(255,255,255,.42); line-height: 1.6; }

/* ══ 6. TESTIMONIALS ══ */
.testimonials-section { min-height: 100vh; background: #f5f7fa; padding: 96px 0; display: flex; align-items: center; }
.testi-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.testi-card  {
  background: #fff; border-radius: 20px; padding: 30px 26px;
  border: 1px solid #eaecf0; display: flex; flex-direction: column; gap: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,.04);
  transition: transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s;
}
.testi-card:hover { transform: translateY(-7px); box-shadow: 0 18px 44px rgba(0,0,0,.1); }
.testi-card--accent { background: #545454; border-color: #545454; box-shadow: 0 10px 36px rgba(84,84,84,.35); }
.testi-card--accent:hover { box-shadow: 0 22px 52px rgba(84,84,84,.45); }
.testi-card--accent .testi-body { color: rgba(255,255,255,.75); }
.testi-card--accent .testi-name { color: #fff; }
.testi-card--accent .testi-role { color: rgba(255,255,255,.45); }
.testi-stars  { font-size: 15px; color: #ffde59; letter-spacing: 3px; }
.testi-body   { font-size: 14px; color: #475569; line-height: 1.8; flex: 1; }
.testi-author { display: flex; align-items: center; gap: 12px; }
.testi-avatar { width: 40px; height: 40px; border-radius: 50%; background: #ffde59; color: #545454; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.testi-name   { font-size: 13px; font-weight: 700; color: #545454; }
.testi-role   { font-size: 11px; color: #94a3b8; margin-top: 2px; }

/* ══ 7. CTA ══ */
.cta-section { min-height: 60vh; background: linear-gradient(135deg, #545454 0%, #2a2a2a 100%); display: flex; align-items: center; padding: 80px 20px; }
.cta-inner   { max-width: 680px; margin: 0 auto; text-align: center; }
.cta-title   { font-size: clamp(28px, 4vw, 50px); font-weight: 900; color: #fff; margin-bottom: 14px; line-height: 1.15; }
.cta-sub     { font-size: 16px; color: rgba(255,255,255,.5); margin-bottom: 36px; line-height: 1.75; }
.cta-btns    { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.btn-cta-primary { display: inline-flex; padding: 15px 32px; border-radius: 14px; background: #ffde59; color: #545454; font-size: 16px; font-weight: 800; text-decoration: none; transition: transform .15s, box-shadow .15s; box-shadow: 0 4px 20px rgba(255,222,89,.4); }
.btn-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,222,89,.55); }
.btn-cta-outline { display: inline-flex; padding: 15px 32px; border-radius: 14px; border: 2px solid rgba(255,255,255,.25); color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; transition: border-color .15s; }
.btn-cta-outline:hover { border-color: rgba(255,255,255,.65); }

/* ══ RESPONSIVE ══ */
@media (max-width: 1200px) {
  .kits-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .kits-grid            { grid-template-columns: repeat(2, 1fr); }
  .cat-grid             { grid-template-columns: repeat(2, 1fr); }
  .why-inner            { grid-template-columns: 1fr; gap: 40px; }
  .testi-grid           { grid-template-columns: 1fr; }
  .about-split-section  { grid-template-columns: 1fr; }
  .split-visual         { min-height: 300px; }
  .split-content        { padding: 48px 32px; }
}
@media (max-width: 768px) {
  .banner-content     { padding: 0 24px; }
  .banner-dots        { left: 24px; bottom: 80px; }
  .banner-title       { font-size: 32px; }
  .kits-grid          { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .featured-inner     { padding: 0 16px; }
  .section-inner      { padding: 0 16px; }
  .why-inner          { padding: 0 16px; }
  .cat-grid           { grid-template-columns: 1fr; }
  .featured-section, .categories-section, .testimonials-section { padding: 64px 0; }
  .why-section        { padding: 64px 0; }
  /* Hide kits 5-8 on mobile — show only 4 */
  .kit-card:nth-child(n+5) { display: none; }
}
@media (max-width: 480px) {
  .kits-grid { grid-template-columns: 1fr; }
  /* Stats strip: shrink text so all 4 fit at narrow widths */
  .bs-num  { font-size: 15px; }
  .bs-lbl  { font-size: 9px; }
  .bs-item { padding: 12px 6px; }
  .bs-div  { height: 22px; }
}
</style>
