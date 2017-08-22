namespace Model
{
	export class BotType
	{
		static Basic = 'Basic';
		static Block = 'Block';
		static Cop = 'Cop'; 
		static Crop = 'Crop'; 
		static Doc = 'Doc';
		static Drop = 'Drop'; 
		static Mop = 'Mop';
	}

	export function getBotName(type: string)
	{
		return type;
	}

	export class State
	{
		static readonly key: string = "state.v1";

		players: Player[] = [];
		started = false;

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
			this.started = true;
			Model.saveState();
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