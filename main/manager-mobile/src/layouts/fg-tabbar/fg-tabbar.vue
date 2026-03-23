<script setup lang="ts">
import { tabbarStore } from './tabbar'
// 'i-carbon-code',
import { tabbarList as _tabBarList, cacheTabbarEnable, selectedTabbarStrategy, TABBAR_MAP } from './tabbarList'

const customTabbarEnable
= selectedTabbarStrategy === TABBAR_MAP.CUSTOM_TABBAR_WITH_CACHE
  || selectedTabbarStrategy === TABBAR_MAP.CUSTOM_TABBAR_WITHOUT_CACHE

/** tabbarList 里面的 path 从 pages.config.ts 得到 */
const tabbarList = _tabBarList.map(item => ({ ...item, path: `/${item.pagePath}` }))
function selectTabBar({ value: index }: { value: number }) {
  const url = tabbarList[index].path
  tabbarStore.setCurIdx(index)
  if (cacheTabbarEnable) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  const hideRedundantTabbarEnable = selectedTabbarStrategy === TABBAR_MAP.CUSTOM_TABBAR_WITH_CACHE
  hideRedundantTabbarEnable
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      console.log('hideTabBar success: ', res)
    },
  })
})
</script>

<template>
  <wd-tabbar
    v-if="customTabbarEnable"
    v-model="tabbarStore.curIdx"
    bordered
    safe-area-inset-bottom
    placeholder
    fixed
    @change="selectTabBar"
  >
    <block v-for="(item, idx) in tabbarList" :key="item.path">
      <wd-tabbar-item v-if="item.iconType === 'uiLib'" :title="item.text" :icon="item.icon" />
      <wd-tabbar-item
        v-else-if="item.iconType === 'unocss' || item.iconType === 'iconfont'"
        :title="item.text"
      >
        <template #icon>
          <view
            h-40rpx
            w-40rpx
            :class="[item.icon, idx === tabbarStore.curIdx ? 'is-active' : 'is-inactive']"
          />
        </template>
      </wd-tabbar-item>
      <wd-tabbar-item v-else-if="item.iconType === 'local'" :title="item.text">
        <template #icon>
          <image :src="item.icon" h-40rpx w-40rpx />
        </template>
      </wd-tabbar-item>
    </block>
  </wd-tabbar>
</template>


<style scoped lang="scss">
:deep(.wd-tabbar) {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(18rpx);
  border-top: 1rpx solid var(--deskbot-color-border);
  box-shadow: 0 -12rpx 32rpx rgba(34, 48, 84, 0.08);
}

:deep(.wd-tabbar-item) {
  color: #7f8ea8;
  font-family: var(--deskbot-font-ui);
}

:deep(.wd-tabbar-item.is-active) {
  color: var(--deskbot-color-primary);
}

.is-active {
  color: var(--deskbot-color-primary);
}

.is-inactive {
  color: #7f8ea8;
}
</style>