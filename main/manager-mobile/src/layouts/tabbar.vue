<script lang="ts" setup>
import type { ConfigProviderThemeVars } from 'wot-design-uni'
import FgTabbar from './fg-tabbar/fg-tabbar.vue'

const themeVars: ConfigProviderThemeVars = {
  colorTheme: '#0957de',
  buttonPrimaryBgColor: '#0957de',
  buttonPrimaryColor: '#ffffff',
  buttonRadius: '999rpx',
  cellGroupBgColor: 'transparent',
  tabsLineColor: '#0957de',
  navbarColor: '#223054',
  navbarBackground: 'rgba(255,255,255,0.86)',
}
</script>

<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
    <FgTabbar />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>
