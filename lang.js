const i18n = {
  en: {
    attach_evidence: "Attach Evidence (Optional)",
    upload_image: "Upload Image",
    record_voice: "Record Voice Note",
    no_complaints_desc: "There are no complaints matching the filter criteria. Submit a new form to populate logs."
  },
  ar: {
    attach_evidence: "إرفاق دليل (اختياري)",
    upload_image: "رفع صورة",
    record_voice: "تسجيل ملاحظة صوتية",
    no_complaints_desc: "لا توجد شكاوى مطابقة لمعايير التصفية. أرسل نموذجًا جديدًا لملء السجلات."
  },
  hi: {
    attach_evidence: "प्रमाण संलग्न करें (वैकल्पिक)",
    upload_image: "छवि अपलोड करें",
    record_voice: "वॉयस नोट रिकॉर्ड करें",
    no_complaints_desc: "फ़िल्टर मानदंड से मेल खाने वाली कोई शिकायत नहीं है।"
  },
  ur: {
    attach_evidence: "ثبوت منسلک کریں (اختیاری)",
    upload_image: "تصویر اپ لوڈ کریں",
    record_voice: "وائس نوٹ ریکارڈ کریں",
    no_complaints_desc: "فلٹر کے معیار سے مماثل کوئی شکایات نہیں ہیں۔"
  }
};

function changeLanguage(lang) {
  localStorage.setItem('taslim_lang', lang);
  
  if (lang === 'ar' || lang === 'ur') {
    document.documentElement.dir = 'rtl';
    document.body.classList.add('rtl-layout');
  } else {
    document.documentElement.dir = 'ltr';
    document.body.classList.remove('rtl-layout');
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      // Handle inputs vs elements
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = i18n[lang][key];
      } else {
        el.textContent = i18n[lang][key];
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('taslim_lang') || 'en';
  changeLanguage(savedLang);
  
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener('change', (e) => {
      changeLanguage(e.target.value);
    });
  }
});
