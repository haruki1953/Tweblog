<script setup lang="ts">
import markdownit from 'markdown-it'
import markdownItLinkAttributes from 'markdown-it-link-attributes'
import { useProfileStore } from '@/stores'
import { computed } from 'vue'

const profileStore = useProfileStore()
const md = markdownit({
  html: true // 启用 HTML 标签支持
}).use(markdownItLinkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noopener noreferrer'
  }
})

const aboutMdHtml = computed(() => {
  const htmlStr = md.render(profileStore.aboutMarkdown)
  return htmlStr
})

const contactLinksInfo = computed(() => {
  return profileStore.externalLinks.filter((i) => i.type === 'contact')
})

const friendLinksInfo = computed(() => {
  return profileStore.externalLinks.filter((i) => i.type === 'friend')
})
</script>
<template>
  <div class="about-page">
    <DataContainerMountedMask>
      <div class="about-page-box">
        <div class="height-center-box">
          <div class="markdown-content">
            <div v-html="aboutMdHtml" class="md-html"></div>
            <div
              class="link-content"
              v-if="contactLinksInfo.length > 0 || friendLinksInfo.length > 0"
            >
              <template v-if="contactLinksInfo.length > 0">
                <h2>联系方式</h2>
                <ExternalLinksGroup type="contact"></ExternalLinksGroup>
              </template>
              <template v-if="friendLinksInfo.length > 0">
                <h2>友情链接</h2>
                <ExternalLinksGroup type="friend"></ExternalLinksGroup>
              </template>
            </div>
            <div class="social-medias-box">
              <SocialMediasGroup></SocialMediasGroup>
            </div>
          </div>
        </div>
      </div>
    </DataContainerMountedMask>
  </div>
</template>

<style lang="scss" scoped>
.about-page-box {
  // margin: var(--layout-top) 0 var(--layout-bottom) 0;
  // min-height: calc(100vh - 60px - 20px - 10vh);
  min-height: 100vh;
  padding: var(--layout-top) 0 var(--layout-bottom) 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition:
    background-color 0.5s,
    color 0.2s;
  .height-center-box {
    width: 100%;
  }
}

.social-medias-box {
  margin-top: 20px;
}

.markdown-content {
  max-width: 920px;
  margin: 0 auto;
  padding: 20px 30px;
  border-radius: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  font-size: 16px;
  color: var(--color-text);
  background-color: var(--color-background-soft);
  transition:
    background-color 0.5s,
    color 0.2s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
  }
}

@media (max-width: 500px) {
  .markdown-content {
    padding: 16px;
  }
}

.link-content {
  padding-top: 10px;
}

@mixin md-html {
  /* 标题 */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--color-heading);
    margin: 15px 5px 10px 5px;
    font-weight: bold;
    transition:
      background-color 0.5s,
      color 0.2s;
  }
  h4,
  h5,
  h6 {
    color: var(--color-heading);
    margin: 10px 5px 8px 5px;
    font-weight: bold;
    transition:
      background-color 0.5s,
      color 0.2s;
  }

  /* 粗体 */
  strong {
    color: var(--color-heading);
    font-weight: bold;
    transition:
      background-color 0.5s,
      color 0.2s;
  }

  /* 段落 */
  p {
    margin: 10px 5px;
  }

  /* 列表 */
  ul,
  ol {
    padding-left: 20px;
  }

  li {
    margin-bottom: 15px;
  }

  /* 链接 */
  a {
    color: var(--el-color-primary);
    text-decoration: none;
    display: inline-block;
  }

  a:hover {
    text-decoration: underline;
  }

  /* 单行代码 */
  code {
    font-family: 'Consolas', 'Courier New', monospace;
    background-color: var(--color-background);
    border: 1px solid var(--color-background-mute);
    border-radius: 3px;
    padding: 2px 4px;
    font-size: 90%;
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }

  /* 多行代码 */
  pre {
    background-color: var(--color-background);
    border: 1px solid var(--color-background-mute);
    border-radius: 5px;
    padding: 10px;
    overflow: auto;
    font-size: 90%;
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }
  pre code {
    background-color: transparent;
    border: none;
    padding: 0;
  }

  /* 引用 */
  blockquote {
    border-left: 4px solid var(--color-background-mute);
    padding-left: 10px;
    margin: 10px 5px;
    color: var(--color-text-soft);
    font-style: italic;
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }

  /* 表格 */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }

  th,
  td {
    border: 1px solid var(--color-background-mute);
    padding: 8px;
    text-align: left;
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }

  th {
    background-color: var(--color-background-mute);
    font-weight: bold;
  }

  /* 图片 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 10px 0;
  }

  /* 分割线 */
  hr {
    border: 0;
    border-top: 1px solid var(--color-border);
    margin: 20px 5px;
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }

  /* 删除线 */
  del {
    text-decoration: line-through;
    color: var(--color-text-soft);
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }

  /* 脚注 */
  sup {
    font-size: 0.8em;
    vertical-align: super;
    color: var(--color-text-soft);
    transition:
      all 0.5s,
      background-color 0.5s,
      color 0.2s;
  }
}

.markdown-content {
  @include md-html;
}

.md-html {
  :deep() {
    @include md-html;
  }
}
</style>
