import {defineWorkspace} from 'vitest/config'

export default defineWorkspace([
    'packages/*',
    {
        test: {
            include: ['tests-e2e/**/*.spec.ts'],
            name: 'e2e',
        }
    },
    {
        test: {
            include: ['tests-integration/**/*.spec.ts'],
            name: 'integration',
        }
    },
    {
        test: {
            include: ['tests-component/**/*.spec.ts'],
            name: 'component',
        }
    },
    {
        test: {
            include: ['tests-unit/**/*.spec.ts'],
            name: 'unit',
        }
    }
])