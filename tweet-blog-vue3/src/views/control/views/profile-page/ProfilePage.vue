<script setup lang="ts">
import NameBio from './components/NameBio.vue'
import AvatarUpdate from './components/AvatarUpdate.vue'
import SocialMedias from './components/SocialMedias.vue'
import ExternalLinks from './components/ExternalLinks.vue'
import AboutMarkdown from './components/AboutMarkdown.vue'
</script>
<template>
  <div class="profile-page">
    <div class="control-box">
      <AvatarUpdate></AvatarUpdate>
    </div>
    <div class="control-box">
      <div class="control-row">
        <NameBio></NameBio>
      </div>
    </div>
    <div class="control-box">
      <SocialMedias></SocialMedias>
    </div>
    <div class="control-box">
      <ExternalLinks type="contact" title="修改联系信息"></ExternalLinks>
    </div>
    <div class="control-box">
      <ExternalLinks type="friend" title="修改友情链接"></ExternalLinks>
    </div>
    <div class="control-box">
      <div class="control-row">
        <AboutMarkdown></AboutMarkdown>
      </div>
      <!-- <div class="control-divider"></div>
      <div class="control-row decoration"></div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../styles/control.scss';
</style>
