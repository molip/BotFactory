namespace Controller
{
	export function makeCard(tag: string)
	{
		if (tag == 'blueprint')
			return new BlueprintCard();
		if (tag == 'sell')
			return new SellCard();
		if (tag == 'sabotage')
			return new SabotageCard();
		if (tag == 'warehouse')
			return new WarehouseCard();
		if (tag == 'production')
			return new ProductionCard();
		if (tag == 'quality')
			return new QualityCard();
		if (tag == 'payday')
			return new PaydayCard();
		if (tag == 'espionage')
			return new EspionageCard();
		if (tag == 'discard')
			return new DiscardCard();
		if (tag == 'market')
			return new MarketCard();
		if (tag == 'crash')
			return new MarketCrashCard();
		if (tag == 'botrot')
			return new BotRotCard();
		if (tag == 'finish')
			return new FinishCard();

		Util.assert(false);
		return null;
	}

	class List
	{
		items: string[] = [];
		constructor(public title: string) { }
	}

	export abstract class Card
	{
		selectIndex = 0;
		radioIndex = 0;

		abstract name: string;

		makeSelectList(): List { return null; }
		makeRadioList(): List { return null; }
		apply() { }
	}

	export class BlueprintCard extends Card
	{
		name = 'Blueprint';

		makeSelectList()
		{
			let list = new List('Bot Type');

			let player = Model.state.getCurrentPlayer();
			if (player.type == Model.BotType.Basic)
				for (let i = 1; i < Model.BotType._Count; ++i) // TODO: Exclude used ones.
					list.items.push(Data.BotDefs[i].name);
			else
				list.items.push(Data.BotDefs[player.type].name);

			return list;
		}

		apply()
		{
			let player = Model.state.getCurrentPlayer();

			if (player.type == Model.BotType.Basic)
			{
				player.type = this.selectIndex + 1;
			}
			else
			{
				++player.productionCards;
				++player.qualityCards;
			}

			Model.state.advance();
		}
	}

	export class SellCard extends Card
	{
		name = 'Sell'; 

		apply()
		{
			Model.state.getCurrentPlayer().money += 6;
			Model.state.advance();
		}
	}

	export class SabotageCard extends Card
	{
		name = 'Sabotage'; 

		makeSelectList()
		{
			let list = new List('Player');
			for (let i = 0; i < Model.state.players.length; ++i)
				if (i != Model.state.currentPlayer)
					list.items.push(Model.state.players[i].name);

			return list;
		}

		apply()
		{
			let index = this.selectIndex;
			if (index >= Model.state.currentPlayer)
				++index;

			Model.state.players[index].sabotaged = true;
			Model.state.advance();
		}
	}

	export class PaydayCard extends Card
	{
		name = 'Payday'; 

		apply()
		{
			Model.state.payday();
			Model.state.advance();
		}
	}

	export class MarketCrashCard extends Card
	{
		name = 'Market Crash';

		apply()
		{
			Model.state.popMarket();
			Model.state.advance();
		}
	}

	export class EspionageCard extends Card
	{
		name = 'Espionage'; 

		apply()
		{
			Model.state.advance();
		}
	}

	export class DiscardCard extends Card
	{
		name = 'Discard'; 

		apply()
		{
			Model.state.advance();
		}
	}

	export class QualityCard extends Card
	{
		name = 'Quality'; 

		apply()
		{
			++Model.state.getCurrentPlayer().qualityCards;
			Model.state.advance();
		}
	}

	export class ProductionCard extends Card
	{
		name = 'Production'; 

		apply()
		{
			++Model.state.getCurrentPlayer().productionCards;
			Model.state.advance();
		}
	}

	export class WarehouseCard extends Card
	{
		name = 'Warehouse'; 

		apply()
		{
			++Model.state.getCurrentPlayer().warehouseCards;
			Model.state.advance();
		}
	}

	export class MarketCard extends Card
	{
		name = 'Market';

		makeSelectList()
		{
			let list = new List('Bot Type');
			for (let i = 1; i < Model.BotType._Count; ++i)
				list.items.push(Data.BotDefs[i].name);

			return list;
		}

		makeRadioList()
		{
			let list = new List('Value');
			list.items = ['-1', '+1', '+2'];
			return list;
		}

		apply()
		{
			let player = Model.state.getCurrentPlayer();
			let type = (this.selectIndex + 1) as Model.BotType;
			let value = [-1, 1, 2][this.radioIndex];
			Model.state.pushMarket(type, value);
		}
	}

	export class BotRotCard extends Card
	{
		name = 'Bot Rot';

		makeRadioList()
		{
			let list = new List('Severity');
			list.items = ['Mild', 'Severe'];
			return list;
		}

		apply()
		{
			let player = Model.state.getCurrentPlayer();
			if (this.radioIndex)
				player.robots = 0;
			else
				player.robots = Math.floor(player.robots / 2);
		}
	}

	export class FinishCard extends Card
	{
		name = 'Finish';

		apply()
		{
			Model.state.getCurrentPlayer().sabotaged = false;
			Model.state.advance();
		}
	}
}
