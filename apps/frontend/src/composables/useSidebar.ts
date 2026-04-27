import { ref } from 'vue';

const isOpen = ref(false);

export function useSidebar() {
  function open() {
    isOpen.value = true;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    isOpen.value = false;
    document.body.style.overflow = '';
  }
  return { isOpen, open, close };
}
