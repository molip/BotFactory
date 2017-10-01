namespace Presenter
{
	let currentCard: Card;
	export let state: State;

	export class CardDef 
	{
		constructor(public name: string, public id: CardID) { }
	}

	export const EventCardDefs = 
	[
		new CardDef('Market', CardID.Market),
		new CardDef('Bot Rot', CardID.Botrot),
		new CardDef('Finish', CardID.Finish),
	];

	export const UpgradeCardDefs =
	[
		new CardDef('Blueprint', CardID.Blueprint),
		new CardDef('Warehouse', CardID.Warehouse),
		new CardDef('Production', CardID.Production),
		new CardDef('Quality', CardID.Quality),
	];

	export const ActionCardDefs =
	[
		new CardDef('Payday', CardID.Payday),
		new CardDef('Market Crash', CardID.Crash),
		new CardDef('Sabotage', CardID.Sabotage),
		new CardDef('Espionage', CardID.Espionage),
		new CardDef('Sell Blueprint', CardID.Sell),
		new CardDef('Discard', CardID.Discard)
	];

	export function onLoad()
	{
		Model.init();
		View.init();
		updateView();
	}

	export function onAddPlayer(name: string)
	{
		name.trim();

		if (name.length)
		{
			Model.state.addPlayer(name);
			updateView();
		}
	}

	export function onStartGame()
	{
		Model.state.start();
		updateView();
	}

	export function onReset()
	{
		if (confirm('Reset game?'))
		{
			Model.resetState();
			updateView();
		}
	}

	export function onSelect(index: number)
	{
		currentCard.selectIndex = index;
	}

	export function onRadio(index: number)
	{
		currentCard.radioIndex = index;
	}

	export function onOK()
	{
		View.hidePage();
		currentCard.apply();
		updateView();
	}

	export function onCancel()
	{
		View.hidePage();
	}

	export function onCardClicked(id: CardID)
	{
		currentCard = makeCard(id);
		View.populateCard(currentCard);
	}

	function updateView()
	{
		state = new State();
		View.update();
	}
}
