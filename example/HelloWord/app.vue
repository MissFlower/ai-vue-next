<script>
export default {
  render() {
    return h('div', 'hello'+this.msg)
  },
  setup() {
    return {
      msg: 'ai-vue-next'
    }
  }
}
</script>