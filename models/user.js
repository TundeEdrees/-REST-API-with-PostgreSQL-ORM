const jwt = require('jsonwebtoken')
const {compare, hashSync} = require('bcrypt')
const validator = require('validator')
const {Sequelize, DataTypes} = require('sequelize')

// For ElephantSQL connection
// const sequelize = new Sequelize(process.env.ESQL_URL, {
//     define: {
//       freezeTableName: true
//     }
//   })

// For localhost SQL
const sequelize = new Sequelize( process.env.PGDB, process.env.PGUSER, process.env.PGPASS,{
    host:process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: "postgresql",
    logging: false
})

const User = sequelize.define('User', {
    id : {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name : {
        type: DataTypes.STRING,
        allowNull: false,        
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true,
        validate: {
            customValidator(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Provide a valid email address')
                }
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            if (value.length <= 6 || value.toLowerCase().includes('password')){
                throw new Error('Password should contain more than 6 characters and should not contain the word `password`')
            }
            else {
                this.setDataValue('password', hashSync(value, 8))
            }
            
        }
    },
    phone : {
        type: DataTypes.STRING,
        unique: true,
        validate : {
            customValidator(value){
                if (!validator.isMobilePhone(value)){
                    throw new Error('Provide a valid phone number')
                }
            }
        }
    },
    country : {
        defaultValue: 'Nigeria',
        type: DataTypes.STRING,
    },
    age : {
        defaultValue: 0,
        type: DataTypes.INTEGER
    },
    tokens: {
        type: DataTypes.STRING
    }
    
}, {
    hooks : {
        // beforeCreate: (user, options) => {
        //     const hashedPass = hashSync(user.password, process.env.num)
        //     user.password = hashedPass
        //     //console.log(token)

        //     //user.tokens = user.tokens.concat(token)
        // },
    }
})

const createCheckTable = async() => {
    try{
        await User.sync({ alter: true })
    }
    catch(e) {
        console.log(e)
    }
}

createCheckTable()

User.findByCred = async (email, password) => {
    const user = await User.findOne({where:{email}})
    if (!user) {
        throw new Error('Unable to login')
    }
    const ismatch = await compare(password, user.password)
    if(!ismatch){
        throw new Error('Unable to login')
    }
    const userr = await User.findOne({where:{email}, attributes:['id', 'name', 'email','phone']})
    return userr

}
User.genToken = async (email) => {
    const user = await User.findOne({where:{email}})
    const token = jwt.sign({email:user.email}, process.env.secret ) 
    await User.update({tokens:token},{
        where: {
            email:user.email
        }
    })
    return token
}

module.exports = User