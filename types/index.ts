export interface Banner {
  id: number
  title: string
  description: string
  image: string
  slug: string
  link_internal: string
}

export interface Teacher {
  id: number
  name: string
  image: string
  description: string
}

export interface Course {
  id: number
  title: string
  slug: string
  image: string
  cover_image: string
  description: string
  level: string
  lessons: number
  class: string
  isHot?: boolean
}

export interface LeaderboardEntry {
  id: number
  rank: number
  name: string
  score: number
  avatar?: string
}

export interface NewsItem {
  id: number
  title: string
  slug: string
  description: string
  content: string
  thumb: string
  cover: string
  author: string
  datetime: string
  tags: string[]
}

export interface Subject {
  id: number
  title: string
  slug: string
  description: string
  icon: string
}

export interface Class {
  id: number
  slug: string
  title: string
  description: string
  icon: string
}

export interface NewsCategory {
  id: number
  title: string
  description: string
  icon: string
  slug: string
}

export interface Practice {
  id: number
  title: string
  description: string
  yt_link: string
  thumb: string
  class: string
  topic: string
}

export interface Document {
  id: number
  title: string
  type: string
  downloads: number
  file_url: string
}

export interface SectionMeta {
  title: string
  icon: string
  description?: string
}

export interface HomePage {
  hero_slide: Banner[]
  title_block_teacher: string
  block_teacher_icon: string
  teachers: Teacher[]
  title_block_courses: string
  block_courses_icon: string
  courses: Course[]
  title_block_rank: string
  block_rank_icon: string
  rank: LeaderboardEntry[]
  title_block_news: string
  block_news_icon: string
  news: NewsItem[]
}

export interface NavigationItem {
  id: number
  title: string
  slug: string
  icon?: string
  is_highlight?: boolean
}

export interface SocialLink {
  id: number
  name: string
  url: string
  icon: string
}

export interface FooterSection {
  title: string
  items: NavigationItem[]
}

export interface GlobalConfig {
  header: {
    logo: {
      text: string
      sub_text: string
      icon: string
      link: string
    }
    search: {
      placeholder: string
      enabled: boolean
    }
    navigation: NavigationItem[]
    buttons: {
      login: {
        text: string
        enabled: boolean
      }
      consultation: {
        text: string
        enabled: boolean
      }
    }
  }
  footer: {
    brand: {
      name: string
      slogan: string
      description: string
    }
    contact: {
      address: string
      phone: string
      email: string
      working_hours: string
    }
    navigation: FooterSection
    resources: FooterSection
    policies: FooterSection
    newsletter: {
      title: string
      description: string
      placeholder: string
      button_text: string
      enabled: boolean
    }
    social: {
      title: string
      links: SocialLink[]
    }
    copyright: {
      text: string
      company: string
    }
    certifications?: Array<{
      id: number
      name: string
      image: string
    }>
  }
  seo: {
    default_title: string
    default_description: string
    default_keywords: string
    og_image: string
  }
  theme: {
    primary_color: string
    secondary_color: string
    success_color: string
    warning_color: string
    error_color: string
  }
  features: {
    maintenance_mode: boolean
    show_promotion_banner: boolean
    enable_chat_support: boolean
    enable_notifications: boolean
  }
}
