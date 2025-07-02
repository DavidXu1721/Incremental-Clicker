export const defaultValues = {
  critClickStats: {
    chance: 0,
    multi: 1
  },
  upgradeStats: [
    {
      name: 'cursor',
      level: 1,
      powerUpCount: 0,
      cost: 40,
      increase: 1,
      // the final part of this cost scaling function is just finding how many powerups we are up so far by checking if the level is in the powerUpIntervals array and if so, what index it is. If not, powerUpIntervals.indexOf(level) + 1 = 0.
      costScalingFunction: (level=1) => (40 * 1.5**(level-1)),
      powerUps: [
        {
          name: "2x clicker power",
          description: 'Double your clicking power!!',
          multiplier: 2,
        },
        {
          name: "critical clicks",
          description: '2% chance for a click to be 100x more powerful',
          critClick: {
            chance: 0.02,
            multi: 100
          },
        },
        {
          name: "better chances",
          description: 'there is now a 4% chance for a critical click',
          critClick: {
            chance: 0.04,
          },
        },
        {
          name: "stronger crits",
          description: 'critical clicks are now 400x more powerful than normal clicks',
          critClick: {
            multi: 400,
          },
        }
      ],
      infoText: 'gems per click',
      imgPath: './assets/images/clicker-white.png'},
    {
      name: 'pickaxe',
      level: 1,
      powerUpCount: 0,
      cost: 130,
      increase: 0.1,
      costScalingFunction: (level=1) => (130 * 1.5**(level-1)),
      powerUps: [
        {
          name: "iron pickaxes",
          description: 'Your miners are twice as effective.',
          multiplier: 2,
        },
        {
          name: "diamond pickaxes",
          description: 'Your miners are twice as effective.',
          multiplier: 2,
        },
        {
          name: "titanium pickaxes",
          description: 'Your miners are twice as effective.',
          multiplier: 2,
        }
      ],
      infoText: 'gems/sec per miner',
      imgPath: './assets/images/pickaxe.png'
    },
    {
      name: 'machinery',
      level: 1,
      powerUpCount: 0,
      powerUps: [
        {
          name: "Mark 2 Coin Pressers",
          description: 'Your factories are twice as effective.',
          multiplier: 2,
        },
        {
          name: "Employee Training",
          description: 'Your factories are twice as effective.',
          multiplier: 2,
        },
        {
          name: "Better Managers",
          description: 'Your factories are twice as effective.',
          multiplier: 2,
        }
      ],
      cost: 2500,
      increase: 1,
      costScalingFunction: (level=1) => (2500 * 1.5**(level-1)),
      infoText: 'gems/sec per factory',
      imgPath: './assets/images/gears.png' 
    },
    {
      name: 'spell_book',
      level: 1,
      powerUpCount: 0,
      powerUps: [
        {
          name: "Better Handwriting",
          description: 'Your wizard towers are twice as effective.',
          multiplier: 2,
        },
        {
          name: "Forbidden Spells",
          description: 'Your wizard towers are twice as effective.',
          multiplier: 2,
        },
        {
          name: "Ancient Rituals",
          description: 'Your wizard towers are twice as effective.',
          multiplier: 2,
        }
      ],
      cost: 30000,
      increase: 10,
      costScalingFunction: (level=1) => (50000 * 1.5**(level-1)),
      infoText: 'gems/sec per wizard tower',
      imgPath: './assets/images/spellBook.png' 
    }
  ],
  buildingStats:[
    {  
      name: 'miner',
      amount: 0,
      production: 1,
      cost: 60,
      costScalingFunction: (amount=1) => (60 * 1.15**amount),
      imgPath: './assets/images/miner.png'
    },
    {
      name: 'factory',
      amount: 0,
      production: 10,
      cost: 400,
      costScalingFunction: (amount=1) => (400 * 1.15**amount),
      imgPath: './assets/images/factory.png'
    },
    {
      name: 'wizard_tower',
      amount: 0,
      production: 80,
      cost: 3000,
      costScalingFunction: (amount=1) => (3000 * 1.15**amount),
      imgPath: './assets/images/wizardTower.png'
    }
  ]
}

export const powerUpIntervals = [10, 20, 30, 40, 50, 70, 100, 150, 200, 250, 300]