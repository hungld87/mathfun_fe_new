<script setup lang="ts">
import type { HomePage } from '~/types'

definePageMeta({
  title: 'Trang chủ · MathFun',
  meta: [
    { name: 'description', content: 'MathFun - Website giáo dục toán tư duy cho học sinh lớp 1-5' }
  ]
})

// Gọi API để lấy toàn bộ dữ liệu trang Home từ Strapi
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const baseUrl = apiBase.replace('/api', '')

const { data: homeResponse } = await useAsyncData('home', async () => {
  try {
    const response = await $fetch(`${apiBase}/home/full`)
    const data = response.data
    
    // Transform Strapi data to frontend format
    return {
      status: 'ok',
      data: {
        hero: {
          slides: data.hero_slides?.map((slide: any) => ({
            id: slide.id,
            title: slide.title,
            description: slide.subtitle || slide.description,
            image: slide.background_image?.url ? `${baseUrl}${slide.background_image.url}` : null,
            imageAlt: slide.image_alt || slide.title,
            link_internal: slide.link_internal || '/',
            link_external: slide.link_external || null
          })) || []
        },
        teachers: {
          title: data.title_block_teacher || 'Giáo viên',
          icon: data.block_teacher_icon?.url || null,
          items: data.teachers?.map((teacher: any) => ({
            id: teacher.id,
            documentId: teacher.documentId,
            name: teacher.name,
            description: teacher.description,
            image: teacher.image?.url ? `${baseUrl}${teacher.image.url}` : null
          })) || []
        },
        weeklyRanking: {
          title: data.title_weekly_ranking || 'Top trong tuần',
          icon: data.weekly_ranking_icon?.url || null,
          weekStart: data.weekly_ranking?.weekStart,
          items: data.weekly_ranking?.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            totalScore: item.totalScore,
            student: {
              id: item.student?.id,
              documentId: item.student?.documentId,
              name: item.student?.name,
              avatar: item.student?.avatar?.url ? `${baseUrl}${item.student.avatar.url}` : null,
              class: item.student?.class
            }
          })) || []
        },
        newsHot: {
          title: data.title_news_hot || 'Tin tức nổi bật',
          icon: data.news_hot_icon?.url || null,
          items: data.news_details?.map((news: any) => ({
            id: news.id,
            documentId: news.documentId,
            title: news.title,
            slug: news.slug,
            description: news.description,
            content: news.content,
            datetime: news.datetime,
            thumb: news.thumb?.url ? `${baseUrl}${news.thumb.url}` : null,
            cover: news.cover?.url ? `${baseUrl}${news.cover.url}` : null
          })) || []
        },
        coursesHot: {
          title: data.title_courses_hot || 'Khoá học tiêu biểu',
          icon: data.courses_hot_icon?.url || null,
          items: data.courses?.map((course: any) => ({
            id: course.id,
            documentId: course.documentId,
            title: course.title,
            slug: course.slug,
            description: course.description,
            content: course.content,
            isHot: course.isHot,
            image: course.image?.url ? `${baseUrl}${course.image.url}` : null,
            coverImage: course.cover_image?.url ? `${baseUrl}${course.cover_image.url}` : null,
            class: course.class ? {
              id: course.class.id,
              documentId: course.class.documentId,
              name: course.class.name,
              isHighlight: course.class.is_highlight
            } : null,
            level: course.level ? {
              id: course.level.id,
              documentId: course.level.documentId,
              title: course.level.title,
              description: course.level.description
            } : null,
            subject: course.subject ? {
              id: course.subject.id,
              documentId: course.subject.documentId,
              name: course.subject.name,
              isDisplay: course.subject.isDisplay,
              icon: course.subject.icon?.url ? `${baseUrl}${course.subject.icon.url}` : null
            } : null
          })) || []
        },
        awards: {
          title: data.title_award || 'Bảng vàng thành tích',
          icon: data.award_icon?.url || null,
          items: data.awards?.map((award: any) => ({
            id: award.id,
            documentId: award.documentId,
            title: award.title,
            slug: award.slug,
            description: award.description,
            content: award.content
          })) || []
        },
        mathfunHighlight: data.mathfun_highlight || null
      }
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return { status: 'error', data: null }
  }
})

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
