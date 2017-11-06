namespace Presenter
{
	export enum CardID { Blueprint, Sell, Sabotage, Warehouse, Production, Quality, Payday, Espionage, Discard, Market, Crash, Botrot, Finish };

	export function makeCard(id: CardID)
	{
		switch (id)
		{
			case CardID.Blueprint: return new BlueprintCard();
			case CardID.Sell: return new SellCard();
			case CardID.Sabotage: return new SabotageCard();
			case CardID.Warehouse: return new WarehouseCard();
			case CardID.Production: return new ProductionCard();
			case CardID.Quality: return new QualityCard();
			case CardID.Payday: return new PaydayCard();
			case CardID.Espionage: return new EspionageCard();
			case CardID.Discard: return new DiscardCard();
			case CardID.Market: return new MarketCard();
			case CardID.Crash: return new MarketCrashCard();
			case CardID.Botrot: return new BotRotCard();
			case CardID.Finish: return new FinishCard();
		}
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
		abstract id: CardID;

		makeSelectList(): List { return null; }
		makeRadioList(): List { return null; }
		apply() { }
	}

	export class BlueprintCard extends Card
	{
		name = 'Blueprint';
		id = CardID.Blueprint;

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
				player.payday();
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
		id = CardID.Sell;

		apply()
		{
			Model.state.getCurrentPlayer().money += 6;
			Model.state.advance();
		}
	}

	export class SabotageCard extends Card
	{
		name = 'Sabotage'; 
		id = CardID.Sabotage;

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
		id = CardID.Payday;

		apply()
		{
			Model.state.payday();
			Model.state.advance();
		}
	}

	export class MarketCrashCard extends Card
	{
		name = 'Market Crash';
		id = CardID.Crash;

		apply()
		{
			Model.state.popMarket();
			Model.state.advance();
		}
	}

	export class EspionageCard extends Card
	{
		name = 'Espionage'; 
		id = CardID.Espionage;

		apply()
		{
			Model.state.advance();
		}
	}

	export class DiscardCard extends Card
	{
		name = 'Discard'; 
		id = CardID.Discard;

		apply()
		{
			Model.state.advance();
		}
	}

	export class QualityCard extends Card
	{
		name = 'Quality'; 
		id = CardID.Quality;

		apply()
		{
			++Model.state.getCurrentPlayer().qualityCards;
			Model.state.advance();
		}
	}

	export class ProductionCard extends Card
	{
		name = 'Production'; 
		id = CardID.Production;

		apply()
		{
			++Model.state.getCurrentPlayer().productionCards;
			Model.state.advance();
		}
	}

	export class WarehouseCard extends Card
	{
		name = 'Warehouse'; 
		id = CardID.Warehouse;

		apply()
		{
			++Model.state.getCurrentPlayer().warehouseCards;
			Model.state.advance();
		}
	}

	export class MarketCard extends Card
	{
		name = 'Market';
		id = CardID.Market;

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
		id = CardID.Botrot;

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
		id = CardID.Finish;

		apply()
		{
			Model.state.getCurrentPlayer().sabotaged = false;
			Model.state.advance();
		}
	}
}
