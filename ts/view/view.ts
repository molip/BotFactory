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

		document.getElementById('reset_button').addEventListener('click', Controller.onReset);
		document.getElementById('start_game_button').addEventListener('click', Controller.onStartGame);
		document.getElementById('add_player_button').addEventListener('click', View.onAddPlayer);
		document.getElementById('cancel_button').addEventListener('click', Controller.onCancel);
		document.getElementById('ok_button').addEventListener('click', Controller.onOK);

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
				let priceCell = new Table.TextCell(player.getPrice().toString());

				if (player.sabotaged)
					productionCell.cellElement.classList.add('sabotaged');

				let marketDelta = player.getMarketDelta();
				if (marketDelta)
					priceCell.cellElement.classList.add(marketDelta < 0 ? 'minus' : 'plus');

				cells.push(new Table.TextCell(Model.getBotName(player.type)));
				cells.push(priceCell);
				cells.push(productionCell);
				cells.push(new Table.TextCell(player.getStorage().toString()));
				cells.push(new Table.TextCell(player.robots.toString()));
				cells.push(new Table.TextCell(player.money.toString()));
			}

			let row = factory.addRow(cells);
			if (index++ == Model.state.currentPlayer)
				row.classList.add('tr_selected');
		}

		let started = Model.state.hasStarted();
		document.getElementById('lobby_div').hidden = started;
		document.getElementById('play_div').hidden = !(started && Model.state.phase == Model.Phase.Play);
		document.getElementById('pickup_div').hidden = !(started && Model.state.phase == Model.Phase.Pickup);
		(document.getElementById('start_game_button') as HTMLButtonElement).disabled = Model.state.players.length == 0;

		let market = Model.state.getMarket();
		let marketString = '';
		if (market)
		{
			marketString = 'Market: ' + Data.BotDefs[market.type].name + 's ';
			if (market.delta > 0)
				marketString += '+';

			marketString += market.delta;
		}
		document.getElementById('market_span').innerText = marketString;
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

		Controller.onCardClicked(tag);
	}

	export function populateCard(cardVM: Controller.Card)
	{
		let contentDiv = document.getElementById('page_content');
		contentDiv.innerHTML = '';

		let title = document.getElementById('page_title');
		title.innerText = cardVM.name;

		let card = new Card(contentDiv);
		let selectList = cardVM.makeSelectList();
		let radioList = cardVM.makeRadioList();

		if (selectList)
		{
			card.addLabel(selectList.title);
			let select = card.addSelect();
			for (let item of selectList.items)
				card.addOption(select, item);
		}

		if (radioList)
		{
			card.addLabel(radioList.title);
			for (let item of radioList.items)
				card.addRadio(item);
		}
	}

	export function hidePage()
	{
		document.getElementById('page').classList.remove('show');
	}
}
