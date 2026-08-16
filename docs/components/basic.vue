<template>
  <virtual-list
    v-model="list"
    data-key="id"
    handle=".handle"
    chosen-class="chosen"
    class="virtual-list"
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

const list = ref(getPageData(1000, 0));
</script>

<style scoped>
.virtual-list {
  height: 500px;
  padding: 5px;
}

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
