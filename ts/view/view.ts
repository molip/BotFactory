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

		div = document.getElementById('upgrade_cards');
		div.appendChild(addTab('Blueprint', 'blueprint'));
		div.appendChild(addTab('Warehouse', 'warehouse'));
		div.appendChild(addTab('Production', 'production'));
		div.appendChild(addTab('Quality', 'quality'));

		div = document.getElementById('action_cards');
		div.appendChild(addTab('Payday', 'payday'));
		div.appendChild(addTab('Sabotage', 'sabotage'));
		div.appendChild(addTab('Espionage', 'espionage'));
		div.appendChild(addTab('Sell Blueprint', 'sell'));
		div.appendChild(addTab('Discard', 'discard'));

		document.getElementById('reset_button').addEventListener('click', Controller.onReset);
		document.getElementById('start_game_button').addEventListener('click', Controller.onStartGame);
		document.getElementById('add_player_button').addEventListener('click', View.onAddPlayer);
		document.getElementById('ok_button').addEventListener('click', Controller.onOK);
		document.getElementById('cancel_button').addEventListener('click', Controller.onCancel);
		document.getElementById('player_name_input').addEventListener('keypress', function (event: KeyboardEvent)
		{
			if (event.keyCode == 13)
				View.onAddPlayer();
		});
	}

	export function update()
	{
		let factory = new Table.Factory(document.getElementById('player_table') as HTMLTableElement);

		factory.addColumnHeader('Name');
		if (Model.state.hasStarted())
		{
			factory.addColumnHeader('Blueprint');
			factory.addColumnHeader('Price');
			factory.addColumnHeader('Production');
			factory.addColumnHeader('Storage');
			factory.addColumnHeader('Robots');
			factory.addColumnHeader('Money');
		}

		let index = 0;
		for (let player of Model.state.players)
		{
			let cells: Table.Cell[] = [];
			cells.push(new Table.TextCell(player.name));

			if (Model.state.hasStarted())
			{
				let productionCell = new Table.TextCell(player.getProduction().toString());
				if (player.sabotaged)
					productionCell.cellElement.classList.add('sabotaged');

				cells.push(new Table.TextCell(Model.getBotName(player.type)));
				cells.push(new Table.TextCell(player.getPrice().toString()));
				cells.push(productionCell);
				cells.push(new Table.TextCell(player.getStorage().toString()));
				cells.push(new Table.TextCell(player.robots.toString()));
				cells.push(new Table.TextCell(player.money.toString()));
			}

			let row = factory.addRow(cells);
			if (index++ == Model.state.currentPlayer)
				row.classList.add('tr_selected');
		}

		document.getElementById('lobby_div').hidden = Model.state.hasStarted();
		document.getElementById('game_div').hidden = !Model.state.hasStarted();
		(document.getElementById('start_game_button') as HTMLButtonElement).disabled = Model.state.players.length == 0;
	}

	export function onAddPlayer()
	{
		let input = document.getElementById('player_name_input') as HTMLInputElement;
		Controller.onAddPlayer(input.value);
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
	}

	export function hidePage()
	{
		document.getElementById('page').classList.remove('show');
	}
}
