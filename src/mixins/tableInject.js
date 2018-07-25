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
        let tr = this.getTableLine(this.$el);
        if (tr !== 0) {
          this.tableRowIndex = Array.prototype.slice.call(tr.parentNode.querySelectorAll('.el-table__row')).indexOf(tr);
        } else {
          this.tableRowIndex = 0;
        }
      }
    }
  },
  methods: {
    getTableLine(DOM) {
      if (DOM.tagName === 'TR') {
        if (DOM.getAttribute('class')) {
          if (DOM.getAttribute('class').indexOf('el-table__row') !== -1) {
            return DOM;
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      } else {
        return this.getTableLine(DOM.parentNode);
      }
    }
  },
  mounted() {
    if (this.elTable) {
      if (this.elTable) {
        let tr = this.getTableLine(this.$el);
        if (tr !== 0) {
          this.tableRowIndex = Array.prototype.slice.call(tr.parentNode.querySelectorAll('.el-table__row')).indexOf(tr);
        } else {
          this.tableRowIndex = 0;
        }
      }
    }
  }
};
