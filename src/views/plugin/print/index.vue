<script lang="ts" setup>
import printJS from 'print-js';

function printTable() {
  printJS({
    printable: [
      { name: 'soybean', wechat: 'honghuangdc', remark: '欢迎来技术交流' },
      { name: 'soybean', wechat: 'honghuangdc', remark: '欢迎来技术交流' }
    ],
    properties: ['name', 'wechat', 'remark'],
    type: 'json'
  });
}
function printImage() {
  printJS({
    printable: [
      'https://i.loli.net/2021/11/24/1J6REWXiHomU2kM.jpg',
      'https://i.loli.net/2021/11/24/1J6REWXiHomU2kM.jpg'
    ],
    type: 'image',
    header: 'Multiple Images',
    imageStyle: 'width:100%;'
  });
}
</script>

<template>
  <div class="h-full">
    <VCard class="card-wrapper">
      <VCardTitle>打印</VCardTitle>
      <VCardText>
        <VBtn color="primary" class="mr-3" variant="flat" @click="printTable">打印表格</VBtn>
        <VBtn color="primary" variant="flat" @click="printImage">打印图片</VBtn>
      </VCardText>
      <VCardActions>
        <GithubLink label="printJS：" link="https://github.com/crabbly/Print.js" />
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped></style>
