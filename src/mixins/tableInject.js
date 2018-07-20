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
      return (this.elTable || {}).disabled || (this.elTable !== '' && this.elTable.tableWithStatus && this.tableRowIndex !== '' && this.elTable.data[this.tableRowIndex].dataStatus === 'delete');
    }
  },
  watch: {
    'elTable.data.length'(val, oldValue) {
      if (this.elTable) {
        this.tableRowIndex = Array.prototype.slice.call(this.getTableLine(this.$el).parentNode.querySelectorAll('.el-table__row')).indexOf(this.getTableLine(this.$el));
        if (this.tableRowIndex < 0) {
          this.tableRowIndex = 0;
        }
      }
    }
  },
  methods: {
    getTableLine(DOM) {
      if (DOM && DOM.tagName === 'TR' && DOM.getAttribute('class').indexOf('el-table__row') !== -1) {
        return DOM;
      } else {
        return this.getTableLine(DOM.parentNode);
      }
    }
  },
  mounted() {
    if (this.elTable) {
      this.tableRowIndex = Array.prototype.slice.call(this.getTableLine(this.$el).parentNode.querySelectorAll('.el-table__row')).indexOf(this.getTableLine(this.$el));
    }
  }
};
