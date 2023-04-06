export default function countTimes(arr) {
	const uniqueCounts = {};
	let maxCount = 0;

	for (let i = 0; i < arr.length; i++) {
		const innerArray = arr[i]?.times;

		for (let j = 0; j < innerArray.length; j++) {
			const element = new Date(innerArray[j]).toISOString();
			if (typeof element === 'string') {
				uniqueCounts[element] = [...(uniqueCounts[element] || []), arr[i]?.name];
				maxCount = Math.max(maxCount, uniqueCounts[element].length);
			}
		}
	}

	return [uniqueCounts, maxCount];
}
