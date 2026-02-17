import Group from "../models/Group";

// Most likely going to need for each method: const { userID } = req.auth()



//create group and make creator admin
export const createGroup = async (req, res) => {
    try {
        const { userId } = req.auth(); // get userID of group creator
        const { name, description } = req.body; // frontend has to pass name and description of group
        
        // logic to find if a group by name exists, if so 

        const admins = [userId];
        const members = [userId];

        await Group.create({
            groupName: name,
            description: description,
            members: members,
            admins: admins
        })

        res.json({
            success: true,
            message: "Group created successfully"
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export const getGroupData = async (req, res) => {

    //make sure to find the correct group by its ID.
    try {
        const { groupID } = req.auth();
        const group = await Group.findById(groupID);
        if (!group) {
            return res.json({
                success: false,
                message: "Group not found"
            });
        }
        res.json({
            success: true,
            group
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
    
}

export const updateGroup = async (req, res) => {
    
}

export const deleteGroup = async (req, res) => {
    
}

export const addGroupMember = async (req, res) => {
    
}

export const removeMember = async (req, res) => {
    
}

export const getMyGroups = async (req, res) => {
    
}