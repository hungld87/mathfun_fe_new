<script setup lang="ts">
import type { HomePage } from '~/types'

definePageMeta({
  title: 'Trang chủ · MathFun',
  meta: [
    { name: 'description', content: 'MathFun - Website giáo dục toán tư duy cho học sinh lớp 1-5' }
  ]
})

// Gọi API để lấy toàn bộ dữ liệu trang Home từ Strapi
const { data: homeResponse } = await useAsyncData('home', () => $fetch('/api/mock/home'))
const homeData = computed(() => homeResponse.value?.data)
</script>

<template>
  <main class="bg-background">
    <!-- Hero Carousel -->
    <div>
      <HeroCarousel :items="homeData?.hero?.slides" />
    </div>

    <!-- Award Section - Bảng Vàng Thành Tích -->
    <AwardSection 
      v-if="homeData?.awards"
      :title="homeData?.awards?.title"
      :icon="homeData?.awards?.icon"
      :awards="homeData?.awards?.items"
    />

    <!-- Teachers Section -->
    <section class="container mx-auto px-6 py-6 md:py-8 max-w-content">
      <TeachersGrid 
        :teachers="homeData?.teachers?.items" 
        :title="homeData?.teachers?.title"
        :icon="homeData?.teachers?.icon"
      />
    </section>

    <!-- Featured Courses Section -->
    <section v-if="homeData?.coursesHot" class="container mx-auto px-6 py-6 md:py-8 max-w-content">
      <FeaturedCourses 
        :courses="homeData?.coursesHot?.items" 
        :title="homeData?.coursesHot?.title"
        :icon="homeData?.coursesHot?.icon"
      />
    </section>

    <!-- Why MathFun Section -->
    <WhyMathFun 
      v-if="homeData?.mathfunHighlight"
      :highlights="homeData?.mathfunHighlight"
    />

    <!-- Leaderboard + News Section -->
    <section class="container mx-auto px-6 py-6 md:py-8 max-w-content overflow-hidden">
      <div class="grid md:grid-cols-2 gap-8 min-w-0">
        <div v-if="homeData?.weeklyRanking?.items && homeData.weeklyRanking.items.length > 0" class="min-w-0">
          <Leaderboard 
            :items="homeData?.weeklyRanking?.items" 
            :title="homeData?.weeklyRanking?.title"
            :icon="homeData?.weeklyRanking?.icon"
          />
        </div>
        <div class="min-w-0" :class="{ 'md:col-span-2': !homeData?.weeklyRanking?.items || homeData.weeklyRanking.items.length === 0 }">
          <NewsList 
            :items="homeData?.newsHot?.items" 
            :title="homeData?.newsHot?.title"
            :icon="homeData?.newsHot?.icon"
          />
        </div>
      </div>
    </section>
  </main>
</template>
