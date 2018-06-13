export default {
  inject: {
    elTable: {
      default: ''
    }
  },
  data() {
    return {
      tableRowIndex: ''
    };
  },
  computed: {
    disabledForTable() {
      return (this.elTable || {}).disabled || (this.elTable !== '' && this.tableRowIndex !== '' && this.elTable.data[this.tableRowIndex].dataStatus === 'delete') ;
    }
  },
  watch: {
    'elTable.data.length'(val, oldValue) {
      if (this.elTable) {
        this.tableRowIndex = Array.prototype.slice.call(this.$el.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.el-table__row')).indexOf(this.$el.parentNode.parentNode.parentNode);
      }
    }
  },
  mounted() {
    if (this.elTable) {
      this.tableRowIndex = Array.prototype.slice.call(this.$el.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.el-table__row')).indexOf(this.$el.parentNode.parentNode.parentNode);
    }
  }
};
