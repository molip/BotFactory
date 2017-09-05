namespace Model
{
	// Same order as Data.BotDefs. Basic must be first.
	export enum BotType { Basic, Block, Cop, Crop, Doc, Drop, Mop, _Count }
	export enum Phase { Play, Pickup };

	export function getBotName(type: BotType)
	{
		return Data.BotDefs[type].name;
	}

	export class Market
	{
		constructor(public type: Model.BotType, public delta: number) { }
	}

	export class State
	{
		static readonly key: string = "state.v1";

		players: Player[] = [];
		currentPlayer = -1;
		phase = Phase.Play;
		private markets: Market[] = [];

		constructor()
		{
		}

		onLoad()
		{
			for (let player of this.players)
				Util.setPrototype(player, Player);
		}

		addPlayer(name: string)
		{
			this.players.push(new Player(name));
			Model.saveState();
		}

		start()
		{
			this.currentPlayer = 0;
			Model.saveState();
		}

		hasStarted()
		{
			return this.currentPlayer >= 0;
		}

		advance()
		{
			Util.assert(this.hasStarted());

			if (this.phase == Phase.Play)
			{
				this.getCurrentPlayer().produce();
				this.phase = Phase.Pickup;
			}
			else
			{
				this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
				this.phase = Phase.Play;
			}

			Model.saveState();
		}

		getCurrentPlayer()
		{
			if (!this.hasStarted())
				return null;

			return this.players[this.currentPlayer];
		}

		payday()
		{
			for (let player of this.players)
				player.payday();
		}

		getMarket()
		{
			return this.markets.length ? this.markets[this.markets.length - 1] : null;
		}

		pushMarket(type: Model.BotType, delta: number)
		{
			this.markets.push(new Model.Market(type, delta));
		}

		popMarket()
		{
			if (this.markets.length >= 1)
				this.markets.pop();
		}
	}

	export let state: State;

	export function init()
	{
		let str = localStorage.getItem(State.key);
		if (str)
		{
			state = JSON.parse(str);
			Util.setPrototype(state, State);
			state.onLoad()
		}
		else
			resetState();
	}

	export function saveState()
	{
		localStorage.setItem(State.key, JSON.stringify(state));
	}

	export function resetState()
	{
		state = new State();
		localStorage.removeItem(State.key);
		saveState();
	}
}