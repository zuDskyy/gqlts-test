// import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
// import { MikroORM } from "@mikro-orm/core";
// import {User} from "./entities/Users";
// import path from 'path';

// export default {
//     migrations:{
//       path: path.join(__dirname,"./migrations"),
//       pattern: /^[\w-]+\d+\.[tj]s$/,
//     },
//         entities:[Post,User],
//         dbName:'postgres',
//         type:'postgresql',
        
//         password:"Okliko123",
//         port:5433,
//         debug:!__prod__,
//         allowGlobalContext:true,
        
// }as Parameters<typeof MikroORM.init>[0];
