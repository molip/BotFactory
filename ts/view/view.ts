namespace View 
{
	export class CardTab
	{
		constructor(public id: Presenter.CardID, public div: HTMLDivElement) { }
	}

	let _cardTabs: CardTab[] = [];

	function addTab(name: string, id: Presenter.CardID)
	{
		let tab = document.createElement('div');
		tab.innerHTML = name.replace(' ', '<br>');
		tab.className = 'card';
		tab.addEventListener('click', () => { Presenter.onCardClicked(id); });
		_cardTabs.push(new CardTab(id, tab));
		return tab;
	}

	export function init()
	{
		let CardID = Presenter.CardID; 

		let div = document.getElementById('event_cards');
		for (let card of Presenter.EventCardDefs)
			div.appendChild(addTab(card.name, card.id));

		div = document.getElementById('upgrade_cards');
		for (let card of Presenter.UpgradeCardDefs)
			div.appendChild(addTab(card.name, card.id));

		div = document.getElementById('action_cards');
		for (let card of Presenter.ActionCardDefs)
			div.appendChild(addTab(card.name, card.id));

		document.getElementById('reset_button').addEventListener('click', Presenter.onReset);
		document.getElementById('start_game_button').addEventListener('click', Presenter.onStartGame);
		document.getElementById('add_player_button').addEventListener('click', View.onAddPlayer);
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

		onCardChanged(null);
	}

	export function onAddPlayer()
	{
		let input = document.getElementById('player_name_input') as HTMLInputElement;
		Presenter.onAddPlayer(input.value);
		input.value = '';
		input.focus();
	}

	export function onCardChanged(card: Presenter.Card)
	{
		for (let cardTab of _cardTabs)
		{
			let select = card && card.id == cardTab.id;
			Util.applyClass(cardTab.div, 'card_selected', select);
			Util.applyClass(cardTab.div, 'card_unselected', !select);
		}

		let contentDiv = document.getElementById('page_content');
		contentDiv.innerHTML = '';

		document.getElementById('page').hidden = !card;

		if (!card)
			return;

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
}
