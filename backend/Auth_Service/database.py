import aioodbc

# database config
server = 'DESKTOP-FH6B6B4\SQLEXPRESS'
database = 'OOS'
username = 'imsadmin'
password = 'imsadmin'
driver = 'ODBC Driver 17 for SQL Server'

# async function to get db connection
async def get_db_connection():
    dsn = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
    )
    conn = await aioodbc.connect(dsn=dsn, autocommit=True)
    return conn

# async function to initialize database schema
async def init_db():
    conn = await get_db_connection()
    cursor = await conn.cursor()

    # Create users table if not exists
    await cursor.execute('''
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE [dbo].[users](
        [id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY CLUSTERED,
        [username] [varchar](50) NOT NULL UNIQUE,
        [password] [varchar](255) NOT NULL,
        [first_name] [varchar](50) NULL,
        [last_name] [varchar](50) NULL,
        [address] [varchar](255) NULL,
        [email] [varchar](100) NULL,
        [phone] [varchar](20) NULL,
        [birthday] [date] NULL,
        [full_name] [varchar](255) NULL,
        [middle_name] [varchar](50) NULL
    )
    ''')

    # Create login_attempts table if not exists
    await cursor.execute('''
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='login_attempts' AND xtype='U')
    CREATE TABLE [dbo].[login_attempts](
        [username] [nvarchar](255) NOT NULL PRIMARY KEY CLUSTERED,
        [failed_attempts] [int] NOT NULL DEFAULT 0,
        [last_failed_at] [datetime] NULL
    )
    ''')

    await conn.commit()
    await cursor.close()
    await conn.close()
