<script setup>
const { data: globalConfig } = await useAsyncData('global-config-footer', () => $fetch('/api/mock/global'))

const footer = computed(() => globalConfig.value?.data?.footer || {})
const brand = computed(() => footer.value.brand || {})
const contact = computed(() => footer.value.contact || {})
const navigation = computed(() => footer.value.navigation?.items || [])
const resources = computed(() => footer.value.resources?.items || [])
const policies = computed(() => footer.value.policies?.items || [])
const centers = computed(() => footer.value.centers?.items || [])
const newsletter = computed(() => footer.value.newsletter || {})
const social = computed(() => footer.value.social?.links || [])
const copyright = computed(() => footer.value.copyright || {})
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-12 mt-16">
    <div class="container mx-auto px-6 max-w-content">
      <!-- Main Footer Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Brand Column -->
        <div>
          <h3 class="text-primary text-xl font-bold mb-3">{{ brand.name || 'MathFun' }}</h3>
          <p class="text-muted text-sm leading-relaxed">
            {{ brand.description || 'Nền tảng giáo dục toán tư duy hàng đầu cho học sinh tiểu học.' }}
          </p>
          
          <!-- Contact Info -->
          <div v-if="contact.phone || contact.email" class="mt-4 space-y-1 text-sm text-muted">
            <p v-if="contact.phone">📞 {{ contact.phone }}</p>
            <p v-if="contact.email">✉️ {{ contact.email }}</p>
            <p v-if="contact.working_hours">🕐 {{ contact.working_hours }}</p>
          </div>
        </div>

        <!-- Navigation Column -->
        <div>
          <h4 class="font-semibold text-text mb-3">{{ footer.navigation?.title || 'Điều hướng' }}</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="item in navigation" :key="item.id">
              <NuxtLink :to="item.slug" class="text-muted hover:text-primary transition">
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Resources Column -->
        <div>
          <h4 class="font-semibold text-text mb-3">{{ footer.resources?.title || 'Tài nguyên' }}</h4>
          <ul class="space-y-2 text-sm">
            <li v-for="item in resources" :key="item.id">
              <NuxtLink :to="item.slug" class="text-muted hover:text-primary transition">
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
          
          <!-- Policies if resources empty -->
          <div v-if="policies.length > 0" class="mt-4">
            <h4 class="font-semibold text-text mb-3">{{ footer.policies?.title || 'Chính sách' }}</h4>
            <ul class="space-y-2 text-sm">
              <li v-for="item in policies" :key="item.id">
                <NuxtLink :to="item.slug" class="text-muted hover:text-primary transition">
                  {{ item.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Centers Column -->
        <div>
          <h4 class="font-semibold text-text mb-3">{{ footer.centers?.title || 'Trung tâm' }}</h4>
          <ul class="space-y-3 text-sm">
            <li v-for="item in centers" :key="item.id" class="text-muted">
              <p class="font-semibold text-text">{{ item.name }}</p>
              <p class="text-xs">{{ item.address }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-center md:text-left">
          <p class="text-muted text-sm">
            {{ copyright.text || `© ${new Date().getFullYear()} MathFun. All rights reserved.` }}
          </p>
          <p v-if="copyright.company" class="text-muted text-xs mt-1">
            {{ copyright.company }}
          </p>
        </div>
        
        <!-- Social Icons -->
        <div v-if="social.length > 0" class="flex gap-4">
          <a 
            v-for="link in social" 
            :key="link.id"
            :href="link.url" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted hover:text-primary transition" 
            :aria-label="link.name"
          >
            <img v-if="link.icon" :src="link.icon" :alt="link.name" class="w-5 h-5" />
            <span v-else class="text-sm">{{ link.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
