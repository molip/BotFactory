namespace View 
{
	export class Card
	{
		private radioDiv: HTMLElement;
		private radioCount = 0;

		constructor(private contentDiv: HTMLElement) { }

		addBreak()
		{
			this.contentDiv.appendChild(document.createElement('br'));
		}

		addLabel(label: string)
		{
			let span = document.createElement('h3');
			span.innerText = label;
			this.contentDiv.appendChild(span);
		}

		addSelect()
		{
			let select = document.createElement('select');
			select.id = 'select';
			select.style.overflow = 'hidden';
			select.addEventListener('change', () => { Controller.onSelect(select.selectedIndex); });
			this.contentDiv.appendChild(select);
			this.addBreak();
			return select;
		}

		addOption(select: HTMLSelectElement, label: string)
		{
			let option = document.createElement('option');
			option.text = label;

			let index = select.childElementCount;
			select.add(option);
			select.disabled = ++select.size <= 1;

			if (index == 0)
				select.selectedIndex = 0;

			return option;
		}

		addRadio(label: string)
		{
			if (!this.radioDiv)
			{
				this.radioDiv = document.createElement('div');
				this.radioDiv.id = 'page_radio_div';
				this.contentDiv.appendChild(this.radioDiv);
			}

			let index = this.radioCount++;

			let radio = document.createElement('input');
			radio.type = "radio"
			radio.name = "radio"
			radio.value = label;
			radio.addEventListener('click', () => { Controller.onRadio(index); });

			this.radioDiv.appendChild(radio);

			if (index == 0)
				radio.checked = true;

			let span = document.createElement('span');
			span.innerText = label;
			this.radioDiv.appendChild(span);

			this.radioDiv.appendChild(document.createElement('br'));
			return radio;
		}
	}
}
