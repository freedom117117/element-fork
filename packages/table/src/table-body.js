import { getCell, getColumnByCell, getRowIdentity } from './util';
import { getStyle, hasClass, addClass, removeClass } from 'element-ui/src/utils/dom';
import ElCheckbox from 'element-ui/packages/checkbox';
import ElTooltip from 'element-ui/packages/tooltip';
import debounce from 'throttle-debounce/debounce';
import LayoutObserver from './layout-observer';
import AsyncValidator from 'async-validator';
import { noop } from 'element-ui/src/utils/util';
import objectAssign from 'element-ui/src/utils/merge';

export default {
  name: 'ElTableBody',

  mixins: [LayoutObserver],

  components: {
    ElCheckbox,
    ElTooltip
  },

  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: Boolean
  },

  render(h) {
    const columnsHidden = this.columns.map((column, index) => this.isColumnHidden(index));
    return (
      <table
        class="el-table__body"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
          {
            this._l(this.columns, column => <col name={column.id} />)
          }
        </colgroup>
        <tbody>
          {
            this._l(this.data, (row, $index) =>
              [<tr
                disabled = {this.table.tableWithStatus && row.dataStatus}
                style={this.rowStyle ? this.getRowStyle(row, $index) : null}
                key={this.table.rowKey ? this.getKeyOfRow(row, $index) : $index}
                on-dblclick={($event) => this.handleDoubleClick($event, row)}
                on-click={($event) => this.handleClick($event, row)}
                on-contextmenu={($event) => this.handleContextMenu($event, row)}
                on-mouseenter={_ => this.handleMouseEnter($index)}
                on-mouseleave={_ => this.handleMouseLeave()}
                class={[this.getRowClass(row, $index)]}>
                {
                  this._l(this.columns, (column, cellIndex) => {
                    const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex);
                    if (!rowspan || !colspan) {
                      return '';
                    } else {
                      if (rowspan === 1 && colspan === 1) {
                        return (
                          <td

                            style={this.getCellStyle($index, cellIndex, row, column)}
                            class={this.getCellClass($index, cellIndex, row, column)}
                            on-focusout={($event) => this.handleCellFocusOut($event, row)}
                            on-mouseenter={($event) => this.handleCellMouseEnter($event, row)}
                            on-mouseleave={this.handleCellMouseLeave}>
                            {
                              column.renderCell.call(
                                this._renderProxy,
                                h,
                                {
                                  row,
                                  column,
                                  $index,
                                  store: this.store,
                                  _self: this.context || this.table.$vnode.context
                                },
                                columnsHidden[cellIndex]
                              )
                            }
                          </td>
                        );
                      } else {
                        return (
                          <td

                            style={this.getCellStyle($index, cellIndex, row, column)}
                            class={this.getCellClass($index, cellIndex, row, column)}
                            rowspan={rowspan}
                            colspan={colspan}
                            on-focusout={($event) => this.handleCellFocusOut($event, row)}
                            on-mouseenter={($event) => this.handleCellMouseEnter($event, row)}
                            on-mouseleave={this.handleCellMouseLeave}>
                            {
                              column.renderCell.call(
                                this._renderProxy,
                                h,
                                {
                                  row,
                                  column,
                                  $index,
                                  store: this.store,
                                  _self: this.context || this.table.$vnode.context
                                },
                                columnsHidden[cellIndex]
                              )
                            }
                          </td>
                        );
                      }
                    }
                  })
                }
              </tr>,
              this.store.isRowExpanded(row)
                ? (<tr>
                  <td colspan={this.columns.length} class="el-table__expanded-cell">
                    {this.table.renderExpanded ? this.table.renderExpanded(h, { row, $index, store: this.store }) : ''}
                  </td>
                </tr>)
                : ''
              ]
            ).concat(
              <el-tooltip tHeight={this.tHeigh} effect={this.table.tooltipEffect} placement="top" ref="tooltip">
                <template slot="content">
                  <div>
                    {this._c('div', {
                      domProps: {
                        innerHTML: this.tooltipContent
                      }
                    })}
                  </div>
                </template>
              </el-tooltip>
            )
          }
        </tbody>
      </table>
    );
  },

  watch: {
    'store.states.hoverRow'(newVal, oldVal) {
      if (!this.store.states.isComplex) return;
      const el = this.$el;
      if (!el) return;
      const tr = el.querySelector('tbody').children;
      const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'));
      const oldRow = rows[oldVal];
      const newRow = rows[newVal];
      if (oldRow) {
        removeClass(oldRow, 'hover-row');
      }
      if (newRow) {
        addClass(newRow, 'hover-row');
      }
    },
    'store.states.currentRow'(newVal, oldVal) {
      if (!this.highlight) return;
      const el = this.$el;
      if (!el) return;
      const data = this.store.states.data;
      const tr = el.querySelector('tbody').children;
      const rows = [].filter.call(tr, row => hasClass(row, 'el-table__row'));
      const oldRow = rows[data.indexOf(oldVal)];
      const newRow = rows[data.indexOf(newVal)];
      if (oldRow) {
        removeClass(oldRow, 'current-row');
      } else {
        [].forEach.call(rows, row => removeClass(row, 'current-row'));
      }
      if (newRow) {
        addClass(newRow, 'current-row');
      }
    }
  },

  computed: {
    tHeigh() {
      return this.move;
    },
    table() {
      return this.$parent;
    },

    data() {
      return this.store.states.data;
    },

    columnsCount() {
      return this.store.states.columns.length;
    },

    leftFixedLeafCount() {
      return this.store.states.fixedLeafColumnsLength;
    },

    rightFixedLeafCount() {
      return this.store.states.rightFixedLeafColumnsLength;
    },

    leftFixedCount() {
      return this.store.states.fixedColumns.length;
    },

    rightFixedCount() {
      return this.store.states.rightFixedColumns.length;
    },

    columns() {
      return this.store.states.columns;
    }
  },

  data() {
    return {
      tHeight: '',
      move: '',
      tooltipContent: '',
      ru: '',
      chu: ''
    };
  },

  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
  },

  methods: {
    getKeyOfRow(row, index) {
      const rowKey = this.table.rowKey;
      if (rowKey) {
        return getRowIdentity(row, rowKey);
      }
      return index;
    },

    isColumnHidden(index) {
      if (this.fixed === true || this.fixed === 'left') {
        return index >= this.leftFixedLeafCount;
      } else if (this.fixed === 'right') {
        return index < this.columnsCount - this.rightFixedLeafCount;
      } else {
        return (index < this.leftFixedLeafCount) || (index >= this.columnsCount - this.rightFixedLeafCount);
      }
    },

    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1;
      let colspan = 1;

      const fn = this.table.spanMethod;
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          rowIndex,
          columnIndex
        });

        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (typeof result === 'object') {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
      }

      return {
        rowspan,
        colspan
      };
    },

    getRowStyle(row, rowIndex) {
      const rowStyle = this.table.rowStyle;
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        });
      }
      return rowStyle;
    },

    getRowClass(row, rowIndex) {
      const classes = ['el-table__row'];

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-table__row--striped');
      }
      const rowClassName = this.table.rowClassName;
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName);
      } else if (typeof rowClassName === 'function') {
        classes.push(rowClassName.call(null, {
          row,
          rowIndex
        }));
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded');
      }
      if (this.table.tableWithStatus && row.dataStatus) {
        classes.push(row.dataStatus);
      }
      return classes.join(' ');
    },

    getCellStyle(rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle;
      if (typeof cellStyle === 'function') {
        return cellStyle.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return cellStyle;
    },

    getCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className];

      if (this.isColumnHidden(columnIndex)) {
        classes.push('is-hidden');
      }

      const cellClassName = this.table.cellClassName;
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName);
      } else if (typeof cellClassName === 'function') {
        classes.push(cellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column
        }));
      }

      return classes.join(' ');
    },

    handleCellMouseEnter(event, row) {
      this.move = event;
      // 移入的时候
      window.localStorage.handleCellMouseLeave = '1';
      const toolti = this.$refs.tooltip;
      if (toolti) {
        toolti.setExpectedState(false);
        toolti.handleClosePopper();
      }
      const table = this.table;
      const cell = getCell(event);

      if (cell) {
        const column = getColumnByCell(table, cell);
        const hoverState = table.hoverState = { cell, column, row };
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event);
      }

      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell');
      if (!hasClass(cellChild, 'el-tooltip')) {
        return;
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange();
      range.setStart(cellChild, 0);
      range.setEnd(cellChild, cellChild.childNodes.length);
      const rangeWidth = range.getBoundingClientRect().width;
      const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0);
      if ((rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth) && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip;
        const column = getColumnByCell(table, cell);
        // TODO 会引起整个 Table 的重新渲染，需要优化
        if (column && column.cellTooltip) {
          this.tooltipContent = cell.querySelector('.cell').innerHTML;
        } else {
          this.tooltipContent = cell.textContent || cell.innerText;
        }
        this.coll = column;
        this.move = this.coll.tHeight;
        var zf = this.tooltipContent;
        zf = zf + '';
        zf = zf.split(';');
        var b = '';
        for (var i = 0; i < zf.length; i++) {
          if (zf[i] !== '') {
            if (i === zf.length - 2 || i === zf.length - 1) {
              b += zf[i];
            } else {
              b += zf[i] + '<br>';
            }
          }
        }
        this.tooltipContent = b;
        tooltip.referenceElm = cell;
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
        tooltip.doDestroy();
        tooltip.setExpectedState(true);
        this.activateTooltip(tooltip);
      }
    },

    handleCellMouseLeave(event) {
      // 移出的时候
      window.localStorage.handleCellMouseLeave = '0';
      setTimeout(() => {
        if (window.localStorage.handleCellMouseLeave === '1') {
        } else {
          const too = this.$refs.tooltip;
          if (too) {
            too.setExpectedState(false);
            too.handleClosePopper();
          }
        }
      }, 400);
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        // tooltip.setExpectedState(false);
        // tooltip.handleClosePopper();
      }
      const cell = getCell(event);
      if (!cell) return;

      const oldHoverState = this.table.hoverState || {};
      this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event);
    },
    handleCellFocusOut(event, row) {
      const cell = getCell(event);
      if (!cell) return;
      if (cell) {
        const column = getColumnByCell(this.table, cell) || {};
        this.validate('blur', row, column, cell, this.table.rules);
        this.table.$emit('cell-blur', row, column, cell, this.table.rules, event);
      }
    },
    validate(trigger, row, column, cell, rules, callback = noop, others) {
      if (!others) {
        others = row;
      }
      if ((!rules || rules.length === 0)) {
        callback();
        return true;
      }
      const descriptor = {};
      if (!column.property) {
        // console.warn('[Element Warn][Table]model is required for validate to work!');
        callback();
        return true;
      }
      if (!rules[column.property]) {
        callback();
        return true;
      }
      if (trigger !== '' && rules[column.property][0].trigger !== trigger) {
        callback();
        return true;
      }
      descriptor[column.property] = (rules[column.property] || []).map(rule => objectAssign({}, rule));
      const validator = new AsyncValidator(descriptor);
      const model = {};
      model[column.property] = row[column.property];
      validator.validate(model, { firstFields: true }, (errors, fields) => {

        this.validateMessage = errors ? errors[0].message : '';
        if (cell.querySelector('.table-error')) {
          cell.querySelector('.table-error').remove();
        }
        if (hasClass(cell, 'is-error')) {
          removeClass(cell, 'is-error');
        }
        if (errors) {
          addClass(cell, 'is-error');
          let node = document.createElement('div');
          node.setAttribute('errormessage', this.validateMessage);
          node.setAttribute('class', 'table-error');
          // node.innerText = '!';
          node.onmouseenter = function(e) {
            let position = e.target.getClientRects()[0];
            let pop = document.createElement('div');
            let rect = document.createElement('div');
            rect.setAttribute('class', 'table-error-rect');
            pop.style.position = 'absolute';
            pop.style.left = position.left + position.width / 2 + 'px';
            pop.style.top = position.top + position.height / 2 - 50 + document.documentElement.scrollTop + 'px';

            pop.setAttribute('class', 'table-error-message');
            let popNode = document.createTextNode(e.target.getAttribute('errormessage'));
            pop.appendChild(popNode);
            document.body.appendChild(pop);

            let width = parseFloat(window.getComputedStyle(document.body.querySelector('.table-error-message')).width);
            let height = parseFloat(window.getComputedStyle(document.body.querySelector('.table-error-message')).height);
            document.body.querySelector('.table-error-message').remove();
            pop.style.left = position.left - width / 2 + 'px';
            rect.style.left = position.left + position.width / 2 - 6 + 'px';
            rect.style.position = pop.style.position;
            rect.style.top = position.top + position.height / 2 - 40 + height + document.documentElement.scrollTop + 'px';
            document.body.appendChild(rect);
            document.body.appendChild(pop);

          };
          node.onmouseleave = function(e) {
            if (document.body.querySelector('.table-error-message')) {
              document.body.querySelector('.table-error-message').remove();
              document.body.querySelector('.table-error-rect').remove();
            }
          };
          cell.querySelector('.cell').appendChild(node);

        };
        callback(this.validateMessage);
      }, others);
    },

    handleMouseEnter(index) {
      this.store.commit('setHoverRow', index);
    },

    handleMouseLeave() {
      this.store.commit('setHoverRow', null);
    },

    handleContextMenu(event, row) {
      this.handleEvent(event, row, 'contextmenu');
    },

    handleDoubleClick(event, row) {
      this.handleEvent(event, row, 'dblclick');
    },

    handleClick(event, row) {
      this.store.commit('setCurrentRow', row);
      this.handleEvent(event, row, 'click');
    },

    handleEvent(event, row, name) {
      const table = this.table;
      const cell = getCell(event);
      let column;
      if (cell) {
        column = getColumnByCell(table, cell);
        if (column) {
          table.$emit(`cell-${name}`, row, column, cell, event);
        }
      }
      table.$emit(`row-${name}`, row, event, column);
    },

    handleExpandClick(row, e) {
      e.stopPropagation();
      this.store.toggleRowExpansion(row);
    }
  }
};
