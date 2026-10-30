/**
 * AgriTech Multilingual Translations
 * Languages supported: English (en), Hindi (hi), Marathi (mr)
 */

export type Language = 'en' | 'hi' | 'mr';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Slogan
    app_name: 'AgriTech',
    tagline: 'Smart Farming Management System',
    empowering: 'Empowering Farmers Through Digital Technology',

    // Navigation
    nav_overview: 'Overview',
    nav_farms: 'My Farms',
    nav_crops: 'Crop Management',
    nav_soil: 'Soil Health',
    nav_weather: 'Weather Forecast',
    nav_pest: 'Pest & Disease Alerts',
    nav_marketplace: 'Marketplace',
    nav_consultation: 'Expert Consultation',
    nav_community: 'Community',
    nav_notifications: 'Notifications',
    nav_admin: 'Admin Console',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_register: 'Register',

    // Dashboard Statistics
    stat_total_farms: 'Total Farms',
    stat_cultivated_land: 'Cultivated Land',
    stat_active_crops: 'Active Crops',
    stat_upcoming_harvests: 'Upcoming Harvests',
    stat_current_temp: 'Current Temperature',
    stat_active_alerts: 'Active Alerts',
    stat_pending_tasks: 'Pending Activities',

    // Quick Actions
    action_add_farm: 'Register Farm',
    action_add_crop: 'Log New Crop',
    action_test_soil: 'Analyze Soil',
    action_report_pest: 'Report Disease',
    action_consult: 'Ask Agronomist',
    action_shop: 'Browse Store',

    // Sections
    sec_weather_summary: 'Live Weather & Spray Window',
    sec_crop_health: 'Crop Growth & Health Overview',
    sec_activity_timeline: 'Farm Activity Timeline',
    sec_soil_health: 'Latest Soil Health Score',
    sec_expert_advice: 'Agronomist Advisories',

    // Common
    acres: 'Acres',
    hectares: 'Hectares',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    submit: 'Submit',
    search: 'Search...',
    filter: 'Filter',
    view_details: 'View Details',
    all: 'All',
    status: 'Status',
    date: 'Date',
    loading: 'Loading...'
  },
  hi: {
    // Brand & Slogan
    app_name: 'एग्रीटेक',
    tagline: 'स्मार्ट फार्मिंग प्रबंधन प्रणाली',
    empowering: 'डिजिटल तकनीक से किसानों का सशक्तिकरण',

    // Navigation
    nav_overview: 'अवलोकन',
    nav_farms: 'मेरे खेत',
    nav_crops: 'फसल प्रबंधन',
    nav_soil: 'मृदा स्वास्थ्य',
    nav_weather: 'मौसम पूर्वानुमान',
    nav_pest: 'कीट एवं रोग चेतावनी',
    nav_marketplace: 'कृषि बाज़ार',
    nav_consultation: 'विशेषज्ञ परामर्श',
    nav_community: 'किसान समुदाय',
    nav_notifications: 'सूचनाएं',
    nav_admin: 'प्रशासन डैशबोर्ड',
    nav_settings: 'सेटिंग्स',
    nav_logout: 'लॉगआउट',
    nav_login: 'लॉग इन',
    nav_register: 'पंजीकरण',

    // Dashboard Statistics
    stat_total_farms: 'कुल खेत',
    stat_cultivated_land: 'कृषि योग्य भूमि',
    stat_active_crops: 'सक्रिय फसलें',
    stat_upcoming_harvests: 'आगामी कटाई',
    stat_current_temp: 'वर्तमान तापमान',
    stat_active_alerts: 'सक्रिय अलर्ट',
    stat_pending_tasks: 'लंबित कार्य',

    // Quick Actions
    action_add_farm: 'नया खेत जोड़ें',
    action_add_crop: 'फसल दर्ज करें',
    action_test_soil: 'मिट्टी की जांच',
    action_report_pest: 'रोग की रिपोर्ट करें',
    action_consult: 'विशेषज्ञ से पूछें',
    action_shop: 'सामग्री खरीदें',

    // Sections
    sec_weather_summary: 'मौसम एवं छिड़काव की स्थिति',
    sec_crop_health: 'फसल विकास व स्वास्थ्य स्थिति',
    sec_activity_timeline: 'खेत की गतिविधियों की समयरेखा',
    sec_soil_health: 'मृदा स्वास्थ्य स्कोर',
    sec_expert_advice: 'कृषि विशेषज्ञ सलाह',

    // Common
    acres: 'एकड़',
    hectares: 'हेक्टेयर',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    submit: 'जमा करें',
    search: 'खोजें...',
    filter: 'फ़िल्टर',
    view_details: 'विवरण देखें',
    all: 'सभी',
    status: 'स्थिति',
    date: 'दिनांक',
    loading: 'लोड हो रहा है...'
  },
  mr: {
    // Brand & Slogan
    app_name: 'अ‍ॅग्रीटेक',
    tagline: 'स्मार्ट शेती व्यवस्थापन प्रणाली',
    empowering: 'डिजिटल तंत्रज्ञानाद्वारे शेतकऱ्यांचे सक्षमीकरण',

    // Navigation
    nav_overview: 'डॅशबोर्ड',
    nav_farms: 'माझी शेती',
    nav_crops: 'पीक व्यवस्थापन',
    nav_soil: 'मातीचे आरोग्य',
    nav_weather: 'हवामान अंदाज',
    nav_pest: 'कीड व रोग सतर्कता',
    nav_marketplace: 'कृषी बाजारपेठ',
    nav_consultation: 'तज्ज्ञ सल्लागार',
    nav_community: 'शेतकरी मंच',
    nav_notifications: 'सूचना',
    nav_admin: 'प्रशासक फलक',
    nav_settings: 'सेटिंग्ज',
    nav_logout: 'लॉगआउट',
    nav_login: 'लॉगिन',
    nav_register: 'नोंदणी करा',

    // Dashboard Statistics
    stat_total_farms: 'एकूण शेतजमीन',
    stat_cultivated_land: 'लागवडीखालील क्षेत्र',
    stat_active_crops: 'सध्याची पिके',
    stat_upcoming_harvests: 'येणारी कापणी',
    stat_current_temp: 'सध्याचे तापमान',
    stat_active_alerts: 'सक्रिय सतर्कता',
    stat_pending_tasks: 'प्रलंबित कामे',

    // Quick Actions
    action_add_farm: 'नवीन शेत जोडा',
    action_add_crop: 'पीक नोंदवा',
    action_test_soil: 'माती परीक्षण करा',
    action_report_pest: 'रोगाची नोंद करा',
    action_consult: 'तज्ज्ञांशी बोला',
    action_shop: 'खरेदी करा',

    // Sections
    sec_weather_summary: 'हवामान आणि फवारणी वेळ',
    sec_crop_health: 'पीक वाढ व आरोग्य आढावा',
    sec_activity_timeline: 'शेती कामांची टाइमलाइन',
    sec_soil_health: 'माती आरोग्य गुण',
    sec_expert_advice: 'कृषी तज्ज्ञांचा सल्ला',

    // Common
    acres: 'एकर',
    hectares: 'हेक्टर',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    edit: 'बदला',
    delete: 'हटवा',
    submit: 'सादर करा',
    search: 'शोधा...',
    filter: 'फिल्टर',
    view_details: 'तपशील पहा',
    all: 'सर्व',
    status: 'स्थिती',
    date: 'दिनांक',
    loading: 'लोड होत आहे...'
  }
};
