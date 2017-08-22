namespace Util
{
	export function assert(condition: boolean, message?: string)
	{
		if (!condition)
		{
			let str = 'Assertion failed';
			if (message)
				str += ': ' + message;

			str += '\n\nCall stack:\n' + (new Error).stack;
			alert(str);
			debugger;
		}
	}

	export function setPrototype(obj: any, type: any)
	{
		obj.__proto__ = type.prototype;
	}
}
