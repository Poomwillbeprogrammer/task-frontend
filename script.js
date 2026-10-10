let tasks = [];

// 7. ฟังก์ชัน addTask ส่ง POST ไปยัง backend
const addTask = async (title, priority) => {
    try {
        await fetch('https://cpe-task-api.onrender.com/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // ต้องบอกเซิร์ฟเวอร์ว่าส่ง JSON ไป
            },
            body: JSON.stringify({ title: title, priority: priority }) // แพ็คของลงกล่อง
        });

        // เมื่อเพิ่มที่ Backend เสร็จ สั่งดึงข้อมูลล่าสุดมาวาดใหม่
        fetchTasks();
    } catch (error) {
        console.error("เพิ่มงานไม่สำเร็จ:", error);
    }
};

// ใช้ querySelector ชี้เป้าไปที่กล่องฟอร์มและอินพุต
const taskList = document.getElementById("tasklist");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const priorityInput = document.querySelector("#priorityInput");
const taskListElement = document.querySelector("#taskItems");

// 4, 5, 6. ฟังก์ชันดึงข้อมูล (fetchTasks) จาก Backend https://cpe-task-api.onrender.com/tasks
const fetchTasks = async () => {
    try {
        taskListElement.innerHTML = "<h3 style=\"text-align: center;\">กำลังดึงข้อมูลจากเซิร์ฟเวอร์...</h3>";

        const response = await fetch('https://cpe-task-api.onrender.com/tasks');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        tasks = data.map(item => {
            return {
                id: item._id,
                title: item.title,
                completed: item.completed,
                priority: item.priority || "low"
            };
        });

        renderTasks();
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        taskListElement.innerHTML = "<h3 style=\"text-align: center; color: red;\">ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่</h3>";
    }
};

// 10. ในฟังก์ชัน renderTasks เพิ่มเครื่องหมาย Single Quote (') ครอบ ${task.id}
const renderTasks = () => {
    if (tasks.length === 0) {
        taskListElement.innerHTML = "<p>🎉 เยี่ยมมาก! ไม่มีงานคงเหลือ</p>";
        return;
    }

    const htmlString = tasks.map(task => {
        const textStyle = task.completed
            ? "text-decoration: line-through; color: gray;"
            : "";

        return `
            <div class="task-card">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" onchange="handleToggle('${task.id}')" ${task.completed ? "checked" : ""}>
                    <span style="${textStyle}">${task.title} <small>(${task.priority || "ไม่มีระดับ"})</small></span>
                </div>
                <button onclick="handleDelete('${task.id}')" style="color: red; cursor: pointer;" type="button">ลบ</button>
            </div>
        `;
    }).join("");

    taskListElement.innerHTML = htmlString;
};

// 11. ใน taskForm.addEventListener > ลบคำสั่ง renderTasks()
taskForm.addEventListener("submit", (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บเมื่อส่งฟอร์ม

    const newTitle = taskInput.value;
    const newPriority = priorityInput.value;

    addTask(newTitle, newPriority);
    taskInput.value = "";
});

// 8. ฟังก์ชัน toggleTaskStatus ส่ง PUT ไปยัง backend
const toggleTaskStatus = async (id) => {
    try {
        await fetch(`https://cpe-task-api.onrender.com/tasks/${id}`, {
            method: 'PUT'
        });
        fetchTasks(); // ดึงข้อมูลใหม่
    } catch (error) {
        console.error("เปลี่ยนสถานะไม่สำเร็จ:", error);
    }
};

// 9. ฟังก์ชัน deleteTask ส่ง DELETE ไปยัง backend
const deleteTask = async (id) => {
    try {
        await fetch(`https://cpe-task-api.onrender.com/tasks/${id}`, {
            method: 'DELETE'
        });
        fetchTasks(); // ดึงข้อมูลใหม่
    } catch (error) {
        console.error("ลบงานไม่สำเร็จ:", error);
    }
};

// 11. ใน handleDelete และ handleToggle > ลบคำสั่ง renderTasks()
const handleDelete = (id) => {
    if (confirm("คุณต้องการลบงานนี้หรือไม่?")) {
        deleteTask(id);
    }
};

const handleToggle = (id) => {
    toggleTaskStatus(id);
};

fetchTasks();