import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  try {
    const response = await axios.get(`${apiBase}/global/full`)
    
    const data = response.data.data
    
    // console.log('===== GLOBAL API RESPONSE =====')
    // console.log('Full response:', JSON.stringify(response.data, null, 2))
    // console.log('data:', data)
    
    // Transform Strapi data to frontend format
    const transformedData = {
      header: {
        logo: {
          text: data.headerLogo?.text || "MATHFUN",
          sub_text: data.headerLogo?.sub_text || "",
          icon: data.headerLogo?.icon?.url ? `${baseUrl}${data.headerLogo.icon.url}` : "M",
          link: data.headerLogo?.link || "/"
        },
        search: {
          placeholder: data.headerSearch?.placeholder || "Tìm kiếm khóa học, bài tập, tài liệu...",
          enabled: data.headerSearch?.enabled !== false
        },
        navigation: (data.headerNavigation || data.footerNavigation)?.map((item: any) => ({
          id: item.id,
          label: item.title,
          link: item.slug.startsWith('/') ? item.slug : `/${item.slug}`,
          icon: item.icon,
          highlight: item.is_highlight || false
        })) || [],
        buttons: {
          login: data.headerButton?.[0] ? {
            text: data.headerButton[0].text || "Đăng nhập",
            enabled: data.headerButton[0].enabled !== false
          } : {
            text: "Đăng nhập",
            enabled: true
          },
          consultation: data.headerButton?.[1] ? {
            text: data.headerButton[1].text || "Yêu cầu tư vấn",
            enabled: data.headerButton[1].enabled !== false
          } : {
            text: "Yêu cầu tư vấn",
            enabled: true
          }
        }
      },
      footer: {
        brand: {
          name: data.footerBrand?.name || "MathFun",
          slogan: data.footerBrand?.slogan || "",
          description: data.footerBrand?.description || ""
        },
        contact: {
          address: data.footerContact?.address || "",
          phone: data.footerContact?.phone || "",
          email: data.footerContact?.email || "",
          working_hours: data.footerContact?.working_hours || ""
        },
        navigation: {
          title: "Liên Kết",
          items: data.footerNavigation?.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug
          })) || []
        },
        resources: {
          title: "Tài Nguyên",
          items: data.footerResources?.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug
          })) || []
        },
        policies: {
          title: "Chính Sách",
          items: data.footerPolicies?.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug
          })) || []
        },
        centers: {
          title: "Trung Tâm",
          items: data.centers?.map((item: any) => ({
            id: item.id,
            name: item.name,
            location: item.location,
            address: item.address
          })) || []
        },
        newsletter: {
          title: data.footerNewsletter?.title || "Đăng Ký Nhận Tin",
          description: data.footerNewsletter?.description || "",
          placeholder: data.footerNewsletter?.placeholder || "Email của bạn",
          button_text: data.footerNewsletter?.button_text || "Đăng ký",
          enabled: data.footerNewsletter?.enabled !== false
        },
        social: {
          title: "Kết Nối Với Chúng Tôi",
          links: data.footerSocaial?.map((item: any) => ({
            id: item.id,
            name: item.name,
            url: item.url,
            icon: item.icon?.url ? `${baseUrl}${item.icon.url}` : null
          })) || []
        },
        copyright: {
          text: data.footerCopyright?.text || "© 2024 MathFun. All rights reserved.",
          company: data.footerCopyright?.company || ""
        },
        certifications: data.footerCertifications?.map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.image?.url ? `${baseUrl}${item.image.url}` : null
        })) || []
      },
      seo: {
        default_title: data.seo?.default_title || "MathFun - Học Toán Thông Minh",
        default_description: data.seo?.default_description || "",
        default_keywords: data.seo?.default_keywords || "",
        og_image: data.seo?.og_image?.url ? `${baseUrl}${data.seo.og_image.url}` : null
      },
      theme: {
        primary_color: data.footerTheme?.primary_color || "#3FB3AA",
        primary_dark_color: data.footerTheme?.primary_dark_color || "#359A91",
        secondary_color: data.footerTheme?.secondary_color || "#FF6B35",
        success_color: data.footerTheme?.success_color || "#27AE60",
        warning_color: data.footerTheme?.warning_color || "#F39C12",
        error_color: data.footerTheme?.error_color || "#E74C3C",
        teal_50: data.footerTheme?.teal_50 || "#F0FDFA",
        teal_100: data.footerTheme?.teal_100 || "#CCFBF1",
        teal_500: data.footerTheme?.teal_500 || "#14B8A6",
        teal_600: data.footerTheme?.teal_600 || "#0D9488"
      },
      features: {
        maintenance_mode: data.footerFeatures?.maintenance_mode || false,
        show_promotion_banner: data.footerFeatures?.show_promotion_banner !== false,
        enable_chat_support: data.footerFeatures?.enable_chat_support !== false,
        enable_notifications: data.footerFeatures?.enable_notifications !== false
      }
    }
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching global data:', error)
    return {
      status: 'error',
      data: null,
      message: 'Failed to fetch global data from API'
    }
  }
})
