namespace Controller
{
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
}
