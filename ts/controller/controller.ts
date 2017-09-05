namespace Controller
{
	let currentCard: Card;

	export function onLoad()
	{
		Model.init();
		View.init();
		View.update();
	}

	export function onAddPlayer(name: string)
	{
		Model.state.addPlayer(name);
		View.update();
	}

	export function onStartGame()
	{
		Model.state.start();
		View.update();
	}

	export function onReset()
	{
		if (confirm('Reset game?'))
		{
			Model.resetState();
			View.update();
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
		View.update();
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
}
