/**
 * Check collision with rect
 * @param {{x:number,y:number,width:number,height:number}} item Rect
 * @param {number} x Cursor X
 * @param {number} y Cursor Y
 * @returns Has collision
 */
export function collideRect(item, x, y) {
	if (item.x > x || item.y > y) {
		return false
	}

	if (x > item.x + item.width || y > item.y + item.height) {
		return false
	}

	return true
}
