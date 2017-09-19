namespace Presenter
{
	let currentCard: Card;
	export let state: State;

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

	export function onCardClicked(tag: string)
	{
		currentCard = makeCard(tag);
		View.populateCard(currentCard);
	}

	function updateView()
	{
		state = new State();
		View.update();
	}
}
