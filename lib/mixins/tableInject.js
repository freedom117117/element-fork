'use strict';

exports.__esModule = true;
exports.default = {
  inject: {
    elTable: {
      default: ''
    }
  },
  data: function data() {
    return {
      tableRowIndex: ''
    };
  },

  computed: {
    disabledForTable: function disabledForTable() {
      return (this.elTable || {}).disabled || this.elTable !== '' && this.elTable.tableWithStatus && this.tableRowIndex !== '' && this.elTable.data[this.tableRowIndex].dataStatus === 'delete';
    }
  },
  watch: {
    'elTable.data.length': function elTableDataLength(val, oldValue) {
      if (this.elTable) {
        var tr = this.getTableLine(this.$el);
        if (tr !== 0) {
          this.tableRowIndex = Array.prototype.slice.call(tr.parentNode.querySelectorAll('.el-table__row')).indexOf(tr);
        } else {
          this.tableRowIndex = 0;
        }
      }
    }
  },
  methods: {
    getTableLine: function getTableLine(DOM) {
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
  mounted: function mounted() {
    if (this.elTable) {
      if (this.elTable) {
        var tr = this.getTableLine(this.$el);
        if (tr !== 0) {
          this.tableRowIndex = Array.prototype.slice.call(tr.parentNode.querySelectorAll('.el-table__row')).indexOf(tr);
        } else {
          this.tableRowIndex = 0;
        }
      }
    }
  }
};