import {
  Filter, repository
} from '@loopback/repository';
import {del, get, param, patch, requestBody} from '@loopback/rest';
import {Armor, Character, Skill, Weapon} from '../models';
import {ArmorRepository, CharacterRepository, SkillRepository, WeaponRepository} from '../repositories';

export class UpdateCharacterController {
  constructor(
    @repository(CharacterRepository)
    public characterRepository : CharacterRepository,
    @repository(WeaponRepository)
    public weaponRepository: WeaponRepository,
    @repository(ArmorRepository)
    public armorRepository : ArmorRepository,
    @repository(SkillRepository)
    public skillRepository : SkillRepository,
  ) {}

  /**
   * get armor, weapon, and skill info
   * @param id character id
   */
   @get('/updatecharacter/{id}', {
    responses: {
      '200': {
        description: 'armor, weapon, and skill info',
        content: {},
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<any[]> {
    const res: any[] = ['no weapon', 'no armor', 'no skill'];

    const filter: Filter = {where:{"characterId":id}};
    if((await this.weaponRepository.find(filter))[0] !== undefined){
      res[0] = await this.characterRepository.weapon(id).get()
    }
    if((await this.armorRepository.find(filter))[0] !== undefined){
      res[1] = await this.characterRepository.armor(id).get()
    }
    if((await this.skillRepository.find(filter))[0] !== undefined){
      res[2] = await this.characterRepository.skill(id).get()
    }
    return res;
  }

  /**
   * levelup for a given character
   * @param id character id
   */
  @patch('/updatecharacter/{id}/levelup', {
    responses: {
      '200': {
        description: 'level up',
        content: {'application/json': {schema: Character}},
      },
    },
  })
  async levelUp(@param.path.string('id') id: string): Promise<Character> {
      const char: Character = await this.characterRepository.findById(id);
      let levels = 0;
      while(char.currentExp! >= char.nextLevelExp!){
        levels++;
        char.currentExp! -= char.nextLevelExp!;
        char.nextLevelExp! += 100;
      }
      // "!" symbol means we guarantee to the compiler that these vars are not undefined.
      char.level! += levels;
      char.maxHealth! += 10 * levels;
      char.currentHealth! = char.maxHealth!;
      char.maxMana! += 5 * levels;
      char.currentMana! = char.maxMana!;
      char.attack! += 3 * levels;
      char.defence! += levels;
      await this.characterRepository!.updateById(id, char);
      return char;
  }

  /**
   * update weapon for a given character
   * @param id character id
   * @param weapon weapon
   */
  @patch('/updatecharacter/{id}/weapon', {
    responses: {
      '200': {
        description: 'update weapon',
        content: {'application/json': {schema: Weapon}},
      },
    },
  })
  async updateWeapon(
    @param.path.string('id') id: string,
    @requestBody() weapon: Weapon,
  ): Promise<Weapon> {
    //equip new weapon
    const char: Character = await this.characterRepository.findById(id);
    char.attack! += weapon.attack;
    char.defence! += weapon.defence;

    //unequip old weapon
    const filter: Filter = {where:{"characterId":id}};
    if((await this.weaponRepository.find(filter))[0] !== undefined){
      const oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
      char.attack! -= oldWeapon.attack;
      char.defence! -= oldWeapon.defence;
      await this.characterRepository.weapon(id).delete();
    }
    await this.characterRepository.updateById(id, char);
    return this.characterRepository.weapon(id).create(weapon);
  }

  /**
   * update armor for a given character
   * @param id character id
   * @param armor armor
   */
  @patch('/updatecharacter/{id}/armor', {
    responses: {
      '200': {
        description: 'update armor',
        content: {'application/json': {schema: Armor}},
      },
    },
  })
  async updateArmor(
    @param.path.string('id') id: string,
    @requestBody() armor: Armor,
  ): Promise<Armor> {
    //equip new armor
    const char: Character = await this.characterRepository.findById(id);
    char.attack! += armor.attack;
    char.defence! += armor.defence;

    //unequip old armor
    const filter: Filter = {where:{"characterId":id}};
    if((await this.armorRepository.find(filter))[0] !== undefined){
      const oldArmor: Armor = await this.characterRepository.armor(id).get();
      char.attack! -= oldArmor.attack;
      char.defence! -= oldArmor.defence;
      await this.characterRepository.armor(id).delete();
    }
    await this.characterRepository.updateById(id, char);
    return this.characterRepository.armor(id).create(armor);
  }

  /**
   * update skill for a given character
   * @param id character id
   * @param skill skill
   */
  @patch('/updatecharacter/{id}/skill', {
    responses: {
      '200': {
        description: 'update skill',
        content: {'application/json': {schema: Skill}},
      },
    },
  })
  async updateSkill(
    @param.path.string('id') id: string,
    @requestBody() skill: Skill,
  ): Promise<Skill> {
    await this.characterRepository.skill(id).delete();
    return this.characterRepository.skill(id).create(skill);
  }

  /**
   * delete weapon for a given character
   * @param id character id
   */
  @del('/updatecharacter/{id}/weapon', {
    responses: {
      '204': {
        description: 'DELETE Weapon',
      },
    },
  })
  async deleteWeapon(
    @param.path.string('id') id: string
  ): Promise<void> {
    //unequip old weapon
    const filter: Filter = {where:{"characterId":id}};
    if((await this.weaponRepository.find(filter))[0] !== undefined){
      const oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
      const char: Character = await this.characterRepository.findById(id);
      char.attack! -= oldWeapon.attack;
      char.defence! -= oldWeapon.defence;
      await this.characterRepository.weapon(id).delete();
      await this.characterRepository.updateById(id, char);
    }
  }

  /**
   * delete armor for a given character
   * @param id character id
   */
  @del('/updatecharacter/{id}/armor', {
    responses: {
      '204': {
        description: 'DELETE Armor',
      },
    },
  })
  async deleteArmor(
    @param.path.string('id') id: string
  ): Promise<void> {
    //unequip old armor
    const filter: Filter = {where:{"characterId":id}};
    if((await this.armorRepository.find(filter))[0] !== undefined){
      const oldArmor: Armor = await this.characterRepository.armor(id).get();
      const char: Character = await this.characterRepository.findById(id);
      char.attack! -= oldArmor.attack;
      char.defence! -= oldArmor.defence;
      await this.characterRepository.armor(id).delete();
      await this.characterRepository.updateById(id, char);
    }
  }

  /**
   * delete skill for a given character
   * @param id character id
   */
  @del('/updatecharacter/{id}/skill', {
    responses: {
      '204': {
        description: 'DELETE Skill',
      },
    },
  })
  async deleteSkill(
    @param.path.string('id') id: string
  ): Promise<void> {
      await this.characterRepository.skill(id).delete();
  }
}
