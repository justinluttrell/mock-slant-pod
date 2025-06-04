// Filament endpoint
// GET /api/filament - Returns available filament types and colors

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { FilamentListResponse, Filament } from '@/types/index.js'
import filamentsData from '../../data/filaments.json'

const filaments = new Hono()

// GET /api/filament - List all available filaments
filaments.get('/', (c: Context) => {
	const response: FilamentListResponse = {
		filaments: filamentsData as Filament[]
	}
	
	return c.json(response)
})

export default filaments 