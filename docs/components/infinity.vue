<template>
  <virtual-list
    v-model="list"
    data-key="id"
    handle=".handle"
    class="infinity-list"
    chosen-class="chosen"
    @bottom="bottomLoading"
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
    <template v-slot:footer>
      <div class="footer">
        <div class="loading"></div>
      </div>
    </template>
  </virtual-list>
</template>

<script setup>
import { ref } from 'vue';
import { getPageData } from '../public/sentence';

const list = ref(getPageData(50, 0));

const bottomLoading = () => {
  setTimeout(() => {
    const index = list.value.length;
    const loadedList = getPageData(10, index);
    list.value.push(...loadedList);
  }, 1000);
};
</script>

<style scoped>
.infinity-list {
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

.footer {
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.loading {
  position: relative;
  width: 30px;
  height: 30px;
  border: 2px solid #000;
  border-top-color: rgba(0, 0, 0, 0.2);
  border-right-color: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-radius: 100%;

  animation: circle infinite 0.75s linear;
}

@keyframes circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
