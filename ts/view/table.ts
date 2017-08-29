namespace View 
{
	export namespace Table 
	{
		export class Cell
		{
			cellElement: HTMLTableDataCellElement= null;

			constructor(public width?: number) // %
			{
				this.cellElement = document.createElement('td');
				if (this.width)
					this.cellElement.style.width = this.width.toString() + '%';
			} 

			getElement(): HTMLTableDataCellElement
			{
				return this.cellElement;
			}
		}

		export class TextCell extends Cell
		{
			constructor(public content: string, width?: number)
			{
				super(width);
			} 
			
			getElement(): HTMLTableDataCellElement
			{
				let e = super.getElement();
				e.innerHTML = this.content;
				return e;
			}
		}

		export class Factory
		{
			table: HTMLTableElement;
			private headerRow: HTMLTableRowElement;
			constructor(table: HTMLTableElement = null)
			{
				this.table = table ? table : document.createElement('table');
				this.table.innerHTML = '';
			}

			addColumnHeader(name: string, width?: number)
			{
				if (!this.headerRow)
				{
					this.headerRow = this.table.insertRow(0);
					this.headerRow.className = 'disabled';
				}

				let th = document.createElement('th');
				this.headerRow.appendChild(th);
				th.innerText = name;
				if (width)
					th.style.width = width.toString() + '%';
			}

			addRow(cells: Cell[])
			{
				let row = document.createElement('tr');
				row.className = 'table_row';
				this.table.appendChild(row);
				for (let cell of cells)
					row.appendChild((cell ? cell : new Cell()).getElement());

				return row;
			}
		}
	}
}
