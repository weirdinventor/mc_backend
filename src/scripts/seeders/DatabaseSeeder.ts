import dotenv from 'dotenv';
dotenv.config();

import seedUsers from './UserSeeder'
import seedPosts from './PostsSeeder'
import seedCategories from './CategorySeeder'
import {AppDependencies} from "../../app/config/AppDependencies";
import {EntityManager} from "typeorm";
import {Identifiers} from "../../core/Identifiers";


const main  = async () => {
    const container = await new AppDependencies().init();
    const db = container.get<EntityManager>(Identifiers.entityManager)

    try {
        await seedUsers(container);
    } catch (error) {
        console.log(error.message);
    }
    try {
        await seedPosts(container);
    } catch (error) {
        console.log(error.message);
    }
    try {
        await seedCategories(container);
    } catch (error) {
        console.log(error.message);
    }

    return db;
}

main().then(db => db.connection.destroy());
