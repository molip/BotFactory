namespace View 
{
	function addTab(name: string, tag: string)
	{
		let tab = document.createElement('div');
		tab.innerText = name;
		tab.className = 'card';
		tab.addEventListener('click', () =>
		{
			onCardClicked(tag, tab);
		});
		return tab;
	}

	export function init()
	{
		let div = document.getElementById('event_cards');
		div.appendChild(addTab('Market', 'market'));
		div.appendChild(addTab('Bot Rot', 'botrot'));
		div.appendChild(addTab('Finish', 'finish'));

		div = document.getElementById('upgrade_cards');
		div.appendChild(addTab('Blueprint', 'blueprint'));
		div.appendChild(addTab('Warehouse', 'warehouse'));
		div.appendChild(addTab('Production', 'production'));
		div.appendChild(addTab('Quality', 'quality'));

		div = document.getElementById('action_cards');
		div.appendChild(addTab('Payday', 'payday'));
		div.appendChild(addTab('Market Crash', 'crash'));
		div.appendChild(addTab('Sabotage', 'sabotage'));
		div.appendChild(addTab('Espionage', 'espionage'));
		div.appendChild(addTab('Sell Blueprint', 'sell'));
		div.appendChild(addTab('Discard', 'discard'));

		document.getElementById('reset_button').addEventListener('click', Presenter.onReset);
		document.getElementById('start_game_button').addEventListener('click', Presenter.onStartGame);
		document.getElementById('add_player_button').addEventListener('click', View.onAddPlayer);
		document.getElementById('cancel_button').addEventListener('click', Presenter.onCancel);
		document.getElementById('ok_button').addEventListener('click', Presenter.onOK);

		document.getElementById('player_name_input').addEventListener('keypress', function (event: KeyboardEvent)
		{
			if (event.keyCode == 13)
				View.onAddPlayer();
		});
	}

	export function update()
	{
		let factory = new Table.Factory(document.getElementById('player_table') as HTMLTableElement);
		const state = Presenter.state;

		factory.addColumnHeader('Name');
		if (!state.showLobby)
		{
			factory.addColumnHeader('Blueprint');
			factory.addColumnHeader('Price');
			factory.addColumnHeader('Production');
			factory.addColumnHeader('Storage');
			factory.addColumnHeader('Robots');
			factory.addColumnHeader('Money');
		}

		for (let player of state.players)
		{
			let cells: Table.Cell[] = [];
			cells.push(new Table.TextCell(player.name));

			if (!state.showLobby)
			{
				let productionCell = new Table.TextCell(player.production);
				if (player.sabotaged)
					productionCell.cellElement.classList.add('sabotaged');

				let priceCell = new Table.TextCell(player.price);
				if (player.priceStyle)
					priceCell.cellElement.classList.add(player.priceStyle);

				cells.push(new Table.TextCell(player.type));
				cells.push(priceCell);
				cells.push(productionCell);
				cells.push(new Table.TextCell(player.storage));
				cells.push(new Table.TextCell(player.robots));
				cells.push(new Table.TextCell(player.money));
			}

			let row = factory.addRow(cells);
			if (player.selected)
				row.classList.add('tr_selected');
		}

		document.getElementById('lobby_div').hidden = !state.showLobby;
		document.getElementById('play_div').hidden = !state.showPlay;
		document.getElementById('pickup_div').hidden = !state.showPickup;
		(document.getElementById('start_game_button') as HTMLButtonElement).disabled = !state.canStart;
		document.getElementById('market_span').innerText = state.market;
	}

	export function onAddPlayer()
	{
		let input = document.getElementById('player_name_input') as HTMLInputElement;
		Presenter.onAddPlayer(input.value);
		input.value = '';
		input.focus();
	}

	function onCardClicked(tag: string, tab: HTMLDivElement)
	{
		let page = document.getElementById('page');
		page.style.left = tab.offsetLeft.toString() + 'px';
		page.style.top = tab.offsetTop.toString() + 'px';
		page.style.width = tab.offsetWidth.toString() + 'px';
		page.style.height = tab.offsetHeight.toString() + 'px';

		document.body.offsetWidth; // Force layout.

		page.style.left = page.style.top = page.style.width = page.style.height = '';
		page.classList.add('show');

		Presenter.onCardClicked(tag);
	}

	export function populateCard(card: Presenter.Card)
	{
		let contentDiv = document.getElementById('page_content');
		contentDiv.innerHTML = '';

		let title = document.getElementById('page_title');
		title.innerText = card.name;

		let cardUI = new Card(contentDiv);
		let selectList = card.makeSelectList();
		let radioList = card.makeRadioList();

		if (selectList)
		{
			cardUI.addLabel(selectList.title);
			let select = cardUI.addSelect();
			for (let item of selectList.items)
				cardUI.addOption(select, item);
		}

		if (radioList)
		{
			cardUI.addLabel(radioList.title);
			for (let item of radioList.items)
				cardUI.addRadio(item);
		}
	}

	export function hidePage()
	{
		document.getElementById('page').classList.remove('show');
	}
}
