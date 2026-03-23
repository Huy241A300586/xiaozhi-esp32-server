/* global self, workbox */

// 自定义Service Worker安装和激活的处理逻辑
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// CDN资源列表
const CDN_CSS = [
  'https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/index.css',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'
];

const CDN_JS = [
  'https://unpkg.com/vue@2.6.14/dist/vue.min.js',
  'https://unpkg.com/vue-router@3.6.5/dist/vue-router.min.js',
  'https://unpkg.com/vuex@3.6.2/dist/vuex.min.js',
  'https://unpkg.com/element-ui@2.15.14/lib/index.js',
  'https://unpkg.com/axios@0.27.2/dist/axios.min.js',
  'https://unpkg.com/opus-decoder@0.7.7/dist/opus-decoder.min.js'
];

// 当Service Worker被注入manifest后会自动执行
const manifest = self.__WB_MANIFEST || [];

// 检查是否BậtCDN模式
const isCDNEnabled = manifest.some(entry => 
  entry.url === 'cdn-mode' && entry.revision === 'enabled'
);

console.log(`Service Worker đã khởi tạo, chế độ CDN: ${isCDNEnabled ? 'Bật' : 'Tắt'}`);

// 注入workbox相关代码
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
workbox.setConfig({ debug: false });

// 开启workbox
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// 预缓存离线页面
const OFFLINE_URL = '/offline.html';
workbox.precaching.precacheAndRoute([
  { url: OFFLINE_URL, revision: null }
]);

// 添加安装完成事件处理器，在控制台显示安装消息
self.addEventListener('install', event => {
  if (isCDNEnabled) {
    console.log('Service Worker đã được cài đặt, bắt đầu lưu cache tài nguyên CDN');
  } else {
    console.log('Service Worker đã được cài đặt, chế độ CDN đang tắt, chỉ lưu cache tài nguyên cục bộ');
  }
  
  // 确保离线页面被缓存
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
});

// 添加激活事件处理器
self.addEventListener('activate', event => {
  console.log('Service Worker đã kích hoạt và đang kiểm soát trang');
  
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // 清理除当前版本外的缓存
          return cacheName.startsWith('workbox-') && !workbox.core.cacheNames.runtime.includes(cacheName);
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// 添加fetch事件拦截器，用于查看CDN资源是否命中缓存
self.addEventListener('fetch', event => {
  // 只有BậtCDN模式时才进行CDN资源缓存监控
  if (isCDNEnabled) {
    const url = new URL(event.request.url);
    
    // 针对CDN资源，输出是否命中缓存的信息
    if ([...CDN_CSS, ...CDN_JS].includes(url.href)) {
      // 不干扰正常的fetch流程，只添加日志
      console.log(`Yêu cầu tài nguyên CDN: ${url.href}`);
    }
  }
});

// 仅在CDN模式下缓存CDN资源
if (isCDNEnabled) {
  // 缓存CDN的CSS资源
  workbox.routing.registerRoute(
    ({ url }) => CDN_CSS.includes(url.href),
    new workbox.strategies.CacheFirst({
      cacheName: 'cdn-stylesheets',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 365 * 24 * 60 * 60, // tăng thời gian cache lên 1 năm
          maxEntries: 10, // cache tối đa 10 file CSS
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200], // phản hồi được cache thành công
        }),
      ],
    })
  );

  // 缓存CDN的JS资源
  workbox.routing.registerRoute(
    ({ url }) => CDN_JS.includes(url.href),
    new workbox.strategies.CacheFirst({
      cacheName: 'cdn-scripts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 365 * 24 * 60 * 60, // tăng thời gian cache lên 1 năm
          maxEntries: 20, // cache tối đa 20 file JS
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200], // phản hồi được cache thành công
        }),
      ],
    })
  );
}

// 无论是否BậtCDN模式，都缓存本地静态资源
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|eot|ttf|otf)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // cache 7 ngày
        maxEntries: 50, // cache tối đa 50 file
      }),
    ],
  })
);

// 缓存HTML页面
workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 1 * 24 * 60 * 60, // cache 1 ngày
        maxEntries: 10, // cache tối đa 10 file HTML
      }),
    ],
  })
);

// 离线页面 - 使用更可靠的处理方式
workbox.routing.setCatchHandler(async ({ event }) => {
  // 根据请求类型返回适当的默认页面
  switch (event.request.destination) {
    case 'document':
      // 如果是网页请求，返回离线页面
      return caches.match(OFFLINE_URL);
    default:
      // 所有其他请求返回错误
      return Response.error();
  }
}); 