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
        this.tableRowIndex = Array.prototype.slice.call(this.$el.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.el-table__row')).indexOf(this.$el.parentNode.parentNode.parentNode);
      }
    }
  },
  mounted: function mounted() {
    if (this.elTable) {
      this.tableRowIndex = Array.prototype.slice.call(this.$el.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.el-table__row')).indexOf(this.$el.parentNode.parentNode.parentNode);
    }
  }
};