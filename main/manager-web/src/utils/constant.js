const HAVE_NO_RESULT = 'Chưa có dữ liệu'
export default {
    HAVE_NO_RESULT, // thông tin cấu hình của dự án
    PAGE: {
        LOGIN: '/login',
    },
    STORAGE_KEY: {
        TOKEN: 'TOKEN',
        PUBLIC_KEY: 'PUBLIC_KEY',
        USER_TYPE: 'USER_TYPE'
    },
    Lang: {
        'zh_cn': 'zh_cn', 'zh_tw': 'zh_tw', 'en': 'en'
    },
    FONT_SIZE: {
        'big': 'big',
        'normal': 'normal',
    }, // lấy một key trong map
    get(map, key) {
        return map[key] || HAVE_NO_RESULT
    }
}
