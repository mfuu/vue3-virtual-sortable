<template>
  <virtual-list
    v-model="list"
    data-key="id"
    handle=".handle"
    :scroller="scroller"
    chosen-class="chosen"
    class="window-scroll"
  >
    <template v-slot:item="{ item, index, key }">
      <div class="list-item">
        <div class="item-title">
          <span class="index">#{{ item.index }}</span>
          <span class="handle">☰</span>
        </div>
        <p>{{ item.desc }}</p>
      </div>
    </template>
  </virtual-list>
</template>

<script setup>
import { ref } from 'vue';
import { getPageData } from '../public/sentence';

const list = ref(getPageData(100, 0));
const scroller = ref(document);
</script>

<style scoped>
.list-item {
  position: relative;
  border-radius: 5px;
  box-shadow: 0px 2px 10px -5px #57bbb4;
  padding: 16px;
}

.item-title {
  display: flex;
  justify-content: space-between;
}

.index {
  float: left;
}

.handle {
  cursor: grab;
  text-align: right;
}

.chosen {
  box-shadow: 0px 0px 0px 2px #306aa4;
}
</style>
