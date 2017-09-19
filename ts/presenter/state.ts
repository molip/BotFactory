namespace Presenter
{
	export class Cell
	{
		constructor(public text: string, public style?: string) { }
	}

	export class Player
	{
		name = '';
		production = '';
		price = '';
		priceStyle = '';
		type = '';
		storage = '';
		robots = '';
		money = '';
		sabotaged = false;
		selected = false;
	}

	export class State
	{
		players: Player[] = [];
		market = '';
		showLobby = false;
		showPlay = false;
		showPickup = false;
		canStart = false; 

		constructor()
		{
			this.players.length = 0;
			let started = Model.state.hasStarted();

			for (let player of Model.state.players)
			{
				let player2 = new Player;
				player2.name = player.name;

				if (started)
				{
					let price = player.getPrice();
					let rawPrice = player.getRawPrice();
					player2.price = price.toString();
					if (price != rawPrice)
						player2.priceStyle = price < rawPrice ? 'minus' : 'plus';

					player2.production = player.getProduction().toString();
					player2.type = Model.getBotName(player.type);
					player2.storage = player.getStorage().toString();
					player2.robots = player.robots.toString();
					player2.money = player.money.toString();
					player2.sabotaged = player.sabotaged;

					if (this.players.length == Model.state.currentPlayer)
						player2.selected = true;
				}

				this.players.push(player2);
			}

			this.showLobby = !started;
			this.showPlay = started && Model.state.phase == Model.Phase.Play;
			this.showPickup = started && Model.state.phase == Model.Phase.Pickup;
			this.canStart = Model.state.players.length > 0;

			let market = Model.state.getMarket();
			if (market)
			{
				this.market = 'Market: ' + Data.BotDefs[market.type].name + 's ';
				if (market.delta > 0)
					this.market += '+';

				this.market += market.delta;
			}
		}
	}
}
